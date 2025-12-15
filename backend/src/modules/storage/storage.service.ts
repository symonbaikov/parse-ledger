import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  SharedLink,
  FilePermission,
  Statement,
  Transaction,
  ShareLinkStatus,
  SharePermissionLevel,
  FilePermissionType,
  Category,
} from '../../entities';
import { CreateSharedLinkDto } from './dto/create-shared-link.dto';
import { UpdateSharedLinkDto } from './dto/update-shared-link.dto';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import * as path from 'path';

const uploadBaseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

/**
 * Storage service for managing file storage, sharing, and permissions
 */
@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(SharedLink)
    private readonly sharedLinkRepository: Repository<SharedLink>,
    @InjectRepository(FilePermission)
    private readonly filePermissionRepository: Repository<FilePermission>,
    @InjectRepository(Statement)
    private readonly statementRepository: Repository<Statement>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Get all files (statements) in storage for a user
   */
  async getStorageFiles(userId: string) {
    try {
      // Get all statements owned by user
      const ownedStatements = await this.statementRepository.find({
        where: { userId },
        relations: ['category'],
        order: { createdAt: 'DESC' },
      });

      // Get all statements shared with user (if permissions table exists)
      let sharedPermissions = [];
      try {
        sharedPermissions = await this.filePermissionRepository.find({
          where: {
            userId,
            isActive: true,
          },
          relations: ['statement', 'statement.category'],
        });
      } catch (error) {
        // If permissions table doesn't exist yet, just use empty array
        console.warn('File permissions table may not exist yet:', error.message);
      }

      const sharedStatements = sharedPermissions
        .map((perm) => perm.statement)
        .filter((stmt) => stmt !== null);

      // Combine and deduplicate
      const allStatements = [...ownedStatements];
      const ownedIds = new Set(ownedStatements.map((s) => s.id));

      for (const sharedStmt of sharedStatements) {
        if (!ownedIds.has(sharedStmt.id)) {
          allStatements.push(sharedStmt);
        }
      }

      // Enrich with permissions info
      const enrichedStatements = await Promise.all(
        allStatements.map(async (statement) => {
          const isOwner = statement.userId === userId;
          let permission = null;
          let sharedLinks = 0;

          try {
            permission = await this.getUserPermissionForStatement(userId, statement.id);
            sharedLinks = await this.sharedLinkRepository.count({
              where: { statementId: statement.id },
            });
          } catch (error) {
            // If tables don't exist yet, use defaults
            console.warn('Storage tables may not exist yet:', error.message);
          }

          return {
            ...statement,
            isOwner,
            permissionType: isOwner ? FilePermissionType.OWNER : permission?.permissionType,
            canReshare: isOwner || permission?.canReshare || false,
            sharedLinksCount: sharedLinks,
          };
        }),
      );

      return enrichedStatements;
    } catch (error) {
      console.error('Error in getStorageFiles:', error);
      throw error;
    }
  }

  private async resolveFilePath(rawPath: string): Promise<string> {
    const basename = path.basename(rawPath);
    const candidates = [
      rawPath,
      path.resolve(rawPath),
      path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath),
      path.join(uploadBaseDir, basename),
      path.join(uploadBaseDir, rawPath),
      path.join(process.cwd(), 'uploads', basename),
      path.join(process.cwd(), 'uploads', rawPath),
      path.join(__dirname, '../../..', 'uploads', basename),
      path.join(__dirname, '../../..', rawPath),
    ];

    for (const candidate of candidates) {
      try {
        const stat = await fs.stat(candidate);
        if (!stat.isFile()) continue;
        return candidate;
      } catch {
        // continue
      }
    }

    throw new NotFoundException('File not found on disk');
  }

  /**
   * Get file details with transactions
   */
  async getFileDetails(statementId: string, userId: string) {
    const statement = await this.statementRepository.findOne({
      where: { id: statementId },
      relations: ['category'],
    });

    if (!statement) {
      throw new NotFoundException('File not found');
    }

    // Check if user has access
    await this.checkFileAccess(userId, statementId, 'view');

    // Get transactions
    const transactions = await this.transactionRepository.find({
      where: { statementId },
      order: { transactionDate: 'DESC' },
      relations: ['category', 'branch', 'wallet'],
    });

    // Get shared links
    const sharedLinks = await this.sharedLinkRepository.find({
      where: { statementId },
      order: { createdAt: 'DESC' },
    });

    // Get permissions
    const permissions = await this.filePermissionRepository.find({
      where: { statementId },
      relations: ['user', 'grantedBy'],
    });

    const isOwner = statement.userId === userId;
    const userPermission = await this.getUserPermissionForStatement(userId, statementId);

    return {
      statement,
      transactions,
      sharedLinks: sharedLinks.map((link) => ({
        ...link,
        // Don't expose password hash
        password: link.password ? '******' : null,
      })),
      permissions,
      isOwner,
      userPermission: isOwner ? FilePermissionType.OWNER : userPermission?.permissionType,
    };
  }

  /**
   * Update category for a statement (file)
   */
  async updateFileCategory(statementId: string, userId: string, categoryId: string | null) {
    await this.checkFileAccess(userId, statementId, 'edit');

    const statement = await this.statementRepository.findOne({
      where: { id: statementId },
      relations: ['category'],
    });

    if (!statement) {
      throw new NotFoundException('File not found');
    }

    let category: Category | null = null;
    if (categoryId) {
      category = await this.categoryRepository.findOne({
        where: {
          id: categoryId,
          userId: statement.userId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    statement.categoryId = category ? category.id : null;
    statement.category = category;

    const saved = await this.statementRepository.save(statement);

    return {
      ...saved,
      category,
    };
  }

  /**
   * Download file
   */
  async downloadFile(statementId: string, userId: string) {
    const statement = await this.statementRepository.findOne({
      where: { id: statementId },
    });

    if (!statement) {
      throw new NotFoundException('File not found');
    }

    // Check if user has download permission
    await this.checkFileAccess(userId, statementId, 'download');

    const filePath = await this.resolveFilePath(statement.filePath);

    return {
      filePath,
      fileName: statement.fileName,
      mimeType: this.getMimeType(statement.fileType),
    };
  }

  /**
   * Get file info for inline preview
   */
  async getFilePreview(statementId: string, userId: string) {
    const statement = await this.statementRepository.findOne({
      where: { id: statementId },
    });

    if (!statement) {
      throw new NotFoundException('File not found');
    }

    // Check if user has permission to view
    await this.checkFileAccess(userId, statementId, 'view');

    const filePath = await this.resolveFilePath(statement.filePath);

    return {
      filePath,
      fileName: statement.fileName,
      mimeType: this.getMimeType(statement.fileType),
    };
  }

  /**
   * Create shared link
   */
  async createSharedLink(
    statementId: string,
    userId: string,
    dto: CreateSharedLinkDto,
  ): Promise<SharedLink> {
    // Check if user has permission to share
    await this.checkFileAccess(userId, statementId, 'share');

    // Generate unique token
    const token = this.generateShareToken();

    // Hash password if provided
    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : null;

    const sharedLink = this.sharedLinkRepository.create({
      statementId,
      userId,
      token,
      permission: dto.permission,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      password: hashedPassword,
      allowAnonymous: dto.allowAnonymous ?? true,
      description: dto.description,
      status: ShareLinkStatus.ACTIVE,
    });

    return await this.sharedLinkRepository.save(sharedLink);
  }

  /**
   * Get shared links for a statement
   */
  async getSharedLinks(statementId: string, userId: string) {
    // Check if user has access to view shared links
    await this.checkFileAccess(userId, statementId, 'view');

    const links = await this.sharedLinkRepository.find({
      where: { statementId },
      order: { createdAt: 'DESC' },
    });

    return links.map((link) => ({
      ...link,
      // Don't expose password hash
      password: link.password ? '******' : null,
    }));
  }

  /**
   * Update shared link
   */
  async updateSharedLink(
    linkId: string,
    userId: string,
    dto: UpdateSharedLinkDto,
  ): Promise<SharedLink> {
    const link = await this.sharedLinkRepository.findOne({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException('Shared link not found');
    }

    // Check if user is owner
    await this.checkFileAccess(userId, link.statementId, 'share');

    // Update fields
    if (dto.permission !== undefined) link.permission = dto.permission;
    if (dto.expiresAt !== undefined) {
      link.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }
    if (dto.password !== undefined) {
      link.password = dto.password ? await bcrypt.hash(dto.password, 10) : null;
    }
    if (dto.status !== undefined) link.status = dto.status;
    if (dto.allowAnonymous !== undefined) link.allowAnonymous = dto.allowAnonymous;
    if (dto.description !== undefined) link.description = dto.description;

    return await this.sharedLinkRepository.save(link);
  }

  /**
   * Delete shared link
   */
  async deleteSharedLink(linkId: string, userId: string): Promise<void> {
    const link = await this.sharedLinkRepository.findOne({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException('Shared link not found');
    }

    // Check if user is owner
    await this.checkFileAccess(userId, link.statementId, 'share');

    await this.sharedLinkRepository.remove(link);
  }

  /**
   * Access shared link (public endpoint)
   */
  async accessSharedLink(token: string, password?: string) {
    const link = await this.sharedLinkRepository.findOne({
      where: { token },
      relations: ['statement', 'statement.category'],
    });

    if (!link) {
      throw new NotFoundException('Shared link not found');
    }

    // Check if link is active
    if (link.status !== ShareLinkStatus.ACTIVE) {
      throw new ForbiddenException('Shared link is not active');
    }

    // Check if link is expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      // Auto-expire the link
      link.status = ShareLinkStatus.EXPIRED;
      await this.sharedLinkRepository.save(link);
      throw new ForbiddenException('Shared link has expired');
    }

    // Check password if required
    if (link.password) {
      if (!password) {
        throw new UnauthorizedException('Password required');
      }
      const isValid = await bcrypt.compare(password, link.password);
      if (!isValid) {
        throw new UnauthorizedException('Invalid password');
      }
    }

    // Update access count and last accessed
    link.accessCount += 1;
    link.lastAccessedAt = new Date();
    await this.sharedLinkRepository.save(link);

    // Get transactions if permission allows
    let transactions = [];
    if (link.permission !== SharePermissionLevel.VIEW) {
      transactions = await this.transactionRepository.find({
        where: { statementId: link.statement.id },
        order: { transactionDate: 'DESC' },
        relations: ['category', 'branch', 'wallet'],
      });
    }

    return {
      statement: link.statement,
      transactions,
      permission: link.permission,
      canDownload: [SharePermissionLevel.DOWNLOAD, SharePermissionLevel.EDIT].includes(
        link.permission,
      ),
    };
  }

  /**
   * Grant permission to user
   */
  async grantPermission(
    statementId: string,
    grantedById: string,
    dto: GrantPermissionDto,
  ): Promise<FilePermission> {
    // Check if granter has permission to share
    await this.checkFileAccess(grantedById, statementId, 'share');

    // Check if permission already exists
    const existing = await this.filePermissionRepository.findOne({
      where: { statementId, userId: dto.userId },
    });

    if (existing) {
      throw new BadRequestException('Permission already exists for this user');
    }

    const permission = this.filePermissionRepository.create({
      statementId,
      userId: dto.userId,
      grantedById,
      permissionType: dto.permissionType,
      canReshare: dto.canReshare ?? false,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      isActive: true,
    });

    return await this.filePermissionRepository.save(permission);
  }

  /**
   * Get permissions for a statement
   */
  async getFilePermissions(statementId: string, userId: string) {
    // Check if user has access
    await this.checkFileAccess(userId, statementId, 'view');

    return await this.filePermissionRepository.find({
      where: { statementId },
      relations: ['user', 'grantedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update permission
   */
  async updatePermission(
    permissionId: string,
    userId: string,
    dto: UpdatePermissionDto,
  ): Promise<FilePermission> {
    const permission = await this.filePermissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if user is owner or granted the permission
    await this.checkFileAccess(userId, permission.statementId, 'share');

    // Update fields
    if (dto.permissionType !== undefined) permission.permissionType = dto.permissionType;
    if (dto.canReshare !== undefined) permission.canReshare = dto.canReshare;
    if (dto.expiresAt !== undefined) {
      permission.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }
    if (dto.isActive !== undefined) permission.isActive = dto.isActive;

    return await this.filePermissionRepository.save(permission);
  }

  /**
   * Revoke permission
   */
  async revokePermission(permissionId: string, userId: string): Promise<void> {
    const permission = await this.filePermissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if user is owner or granted the permission
    await this.checkFileAccess(userId, permission.statementId, 'share');

    await this.filePermissionRepository.remove(permission);
  }

  /**
   * Check if user has specific access to a file
   */
  private async checkFileAccess(
    userId: string,
    statementId: string,
    requiredAction: 'view' | 'download' | 'edit' | 'share',
  ): Promise<void> {
    const statement = await this.statementRepository.findOne({
      where: { id: statementId },
    });

    if (!statement) {
      throw new NotFoundException('File not found');
    }

    // Owner has all permissions
    if (statement.userId === userId) {
      return;
    }

    // Check file permissions
    const permission = await this.getUserPermissionForStatement(userId, statementId);

    if (!permission || !permission.isActive) {
      throw new ForbiddenException('You do not have access to this file');
    }

    // Check if permission is expired
    if (permission.expiresAt && new Date(permission.expiresAt) < new Date()) {
      throw new ForbiddenException('Your permission has expired');
    }

    // Check action permission
    const hasPermission = this.checkActionPermission(
      permission.permissionType,
      requiredAction,
      permission.canReshare,
    );

    if (!hasPermission) {
      throw new ForbiddenException(`You do not have permission to ${requiredAction} this file`);
    }
  }

  /**
   * Get user permission for a statement
   */
  private async getUserPermissionForStatement(
    userId: string,
    statementId: string,
  ): Promise<FilePermission | null> {
    return await this.filePermissionRepository.findOne({
      where: {
        userId,
        statementId,
        isActive: true,
      },
    });
  }

  /**
   * Check if permission type allows specific action
   */
  private checkActionPermission(
    permissionType: FilePermissionType,
    action: 'view' | 'download' | 'edit' | 'share',
    canReshare: boolean,
  ): boolean {
    switch (action) {
      case 'view':
        return [
          FilePermissionType.OWNER,
          FilePermissionType.EDITOR,
          FilePermissionType.VIEWER,
          FilePermissionType.DOWNLOADER,
        ].includes(permissionType);
      case 'download':
        return [
          FilePermissionType.OWNER,
          FilePermissionType.EDITOR,
          FilePermissionType.DOWNLOADER,
        ].includes(permissionType);
      case 'edit':
        return [FilePermissionType.OWNER, FilePermissionType.EDITOR].includes(permissionType);
      case 'share':
        return permissionType === FilePermissionType.OWNER || canReshare;
      default:
        return false;
    }
  }

  /**
   * Generate unique share token
   */
  private generateShareToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get MIME type from file type
   */
  private getMimeType(fileType: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      csv: 'text/csv',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };

    return mimeTypes[fileType.toLowerCase()] || 'application/octet-stream';
  }
}
