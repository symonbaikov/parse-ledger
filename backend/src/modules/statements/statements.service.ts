import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import type { Repository } from 'typeorm';
import { FileStorageService } from '../../common/services/file-storage.service';
import { calculateFileHash } from '../../common/utils/file-hash.util';
import { getFileTypeFromMime } from '../../common/utils/file-validator.util';
import { normalizeFilename } from '../../common/utils/filename.util';
import { WorkspaceMember, WorkspaceRole } from '../../entities';
import { AuditAction, AuditLog } from '../../entities/audit-log.entity';
import {
  BankName,
  type FileType,
  Statement,
  StatementStatus,
} from '../../entities/statement.entity';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { StatementProcessingService } from '../parsing/services/statement-processing.service';
import type { UpdateStatementDto } from './dto/update-statement.dto';

const execAsync = promisify(exec);

@Injectable()
export class StatementsService {
  constructor(
    @InjectRepository(Statement)
    private statementRepository: Repository<Statement>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    private readonly fileStorageService: FileStorageService,
    private statementProcessingService: StatementProcessingService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async getWorkspaceId(userId: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'workspaceId'],
    });
    return user?.workspaceId ?? null;
  }

  private async ensureCanEditStatements(userId: string): Promise<void> {
    const workspaceId = await this.getWorkspaceId(userId);
    if (!workspaceId) return;

    const membership = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId },
      select: ['role', 'permissions'],
    });

    if (!membership) return;
    if ([WorkspaceRole.ADMIN, WorkspaceRole.OWNER].includes(membership.role)) return;

    if (membership.permissions?.canEditStatements === false) {
      throw new ForbiddenException('Недостаточно прав для редактирования выписок');
    }
  }

  private async ensureCanModify(statement: Statement, userId: string): Promise<void> {
    await this.ensureCanEditStatements(userId);
    if (statement.userId === userId) {
      return;
    }
    const workspaceId = await this.getWorkspaceId(userId);
    if (workspaceId && statement.user?.workspaceId === workspaceId) {
      const membership = await this.workspaceMemberRepository.findOne({
        where: { workspaceId, userId },
        select: ['role'],
      });
      if (membership && [WorkspaceRole.ADMIN, WorkspaceRole.OWNER].includes(membership.role)) {
        return;
      }
    }
    throw new ForbiddenException('Недостаточно прав для изменения выписки');
  }

  async create(
    user: User,
    file: Express.Multer.File,
    googleSheetId?: string,
    walletId?: string,
    branchId?: string,
    allowDuplicates = false,
  ): Promise<Statement> {
    await this.ensureCanEditStatements(user.id);
    const normalizedName = normalizeFilename(file.originalname);
    const fileHash = await calculateFileHash(file.path);

    const duplicate = await this.statementRepository.findOne({
      where: { userId: user.id, fileHash },
    });

    if (duplicate && !allowDuplicates) {
      throw new ConflictException('Такая выписка уже загружена (дубликат файла)');
    }
    // Calculate file hash
    let fileData: Buffer | null = null;
    try {
      fileData = await fs.promises.readFile(file.path);
    } catch (error) {
      console.warn(
        `[Statements] Failed to read uploaded file for DB storage: ${(error as Error)?.message}`,
      );
    }

    // Create new statement
    const statement = this.statementRepository.create({
      userId: user.id,
      googleSheetId: googleSheetId || null,
      fileName: normalizedName,
      filePath: file.path,
      fileType: getFileTypeFromMime(file.mimetype) as FileType,
      fileSize: file.size,
      fileHash,
      bankName: BankName.OTHER, // Will be determined during parsing
      status: StatementStatus.UPLOADED,
    });

    const savedStatement = (await this.statementRepository.save(statement)) as unknown as Statement;
    let storedInDb = false;
    if (fileData) {
      try {
        await this.statementRepository.update(savedStatement.id, { fileData });
        storedInDb = true;
      } catch (error) {
        console.warn(
          `[Statements] Failed to persist uploaded file in DB: ${(error as Error)?.message}`,
        );
      }
    }

    // Keep disk copy even if stored in DB to allow previews without DB select issues

    // Log to audit
    await this.auditLogRepository.save({
      userId: user.id,
      action: AuditAction.STATEMENT_UPLOAD,
      description: `Uploaded statement: ${file.originalname}`,
      metadata: {
        statementId: savedStatement.id,
        fileName: file.originalname,
        fileSize: file.size,
      },
    });

    // Start processing asynchronously
    Promise.resolve(this.statementProcessingService.processStatement(savedStatement.id)).catch(
      error => {
        console.error('Error processing statement:', error);
      },
    );

    return savedStatement;
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<{
    data: Statement[];
    total: number;
    page: number;
    limit: number;
  }> {
    const workspaceId = await this.getWorkspaceId(userId);
    const qb = this.statementRepository
      .createQueryBuilder('statement')
      .leftJoinAndSelect('statement.user', 'user')
      .where('statement.deletedAt IS NULL')
      .orderBy('statement.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (workspaceId) {
      qb.andWhere('user.workspaceId = :workspaceId OR statement.userId = :userId', {
        workspaceId,
        userId,
      });
    } else {
      qb.andWhere('statement.userId = :userId', { userId });
    }

    if (search) {
      qb.andWhere('statement.fileName ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [dataRaw, total] = await qb.getManyAndCount();
    const data = await Promise.all(
      dataRaw.map(async st => {
        const availability = await this.fileStorageService.getFileAvailability(st);
        (st as any).hasFileOnDisk = availability.onDisk;
        (st as any).hasFileInDb = availability.inDb;
        (st as any).fileAvailability = availability;
        return st;
      }),
    );

    return { data, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<Statement> {
    const workspaceId = await this.getWorkspaceId(userId);
    if (typeof (this.statementRepository as any).createQueryBuilder !== 'function') {
      const statement = await this.statementRepository.findOne({
        where: workspaceId
          ? [
              { id, userId },
              { id, user: { workspaceId } as any },
            ]
          : { id, userId },
        relations: ['transactions', 'googleSheet', 'user'],
      } as any);

      if (!statement) {
        throw new NotFoundException('Statement not found');
      }

      const availability = await this.fileStorageService.getFileAvailability(statement);
      (statement as any).hasFileOnDisk = availability.onDisk;
      (statement as any).hasFileInDb = availability.inDb;
      (statement as any).fileAvailability = availability;

      return statement as Statement;
    }

    const qb = this.statementRepository
      .createQueryBuilder('statement')
      .leftJoinAndSelect('statement.transactions', 'transactions')
      .leftJoinAndSelect('statement.googleSheet', 'googleSheet')
      .leftJoinAndSelect('statement.user', 'owner')
      .where('statement.id = :id', { id });

    if (workspaceId) {
      qb.andWhere('(statement.userId = :userId OR owner.workspaceId = :workspaceId)', {
        userId,
        workspaceId,
      });
    } else {
      qb.andWhere('statement.userId = :userId', { userId });
    }

    const statement = await qb.getOne();

    if (!statement) {
      throw new NotFoundException('Statement not found');
    }

    const availability = await this.fileStorageService.getFileAvailability(statement);
    (statement as any).hasFileOnDisk = availability.onDisk;
    (statement as any).hasFileInDb = availability.inDb;
    (statement as any).fileAvailability = availability;

    return statement as Statement;
  }

  async updateMetadata(
    id: string,
    userId: string,
    updateDto: UpdateStatementDto,
  ): Promise<Statement> {
    const statement = await this.findOne(id, userId);
    await this.ensureCanModify(statement, userId);

    if (updateDto.balanceStart !== undefined) {
      statement.balanceStart =
        updateDto.balanceStart === null ? null : Number(updateDto.balanceStart);
    }

    if (updateDto.balanceEnd !== undefined) {
      statement.balanceEnd = updateDto.balanceEnd === null ? null : Number(updateDto.balanceEnd);
    }

    if (updateDto.statementDateFrom !== undefined) {
      statement.statementDateFrom = updateDto.statementDateFrom
        ? new Date(updateDto.statementDateFrom)
        : null;
    }

    if (updateDto.statementDateTo !== undefined) {
      statement.statementDateTo = updateDto.statementDateTo
        ? new Date(updateDto.statementDateTo)
        : null;
    }

    if (statement.parsingDetails) {
      statement.parsingDetails = {
        ...statement.parsingDetails,
        metadataExtracted: {
          ...(statement.parsingDetails.metadataExtracted || {}),
          balanceStart: statement.balanceStart ?? undefined,
          balanceEnd: statement.balanceEnd ?? undefined,
          dateFrom: statement.statementDateFrom
            ? statement.statementDateFrom.toISOString().split('T')[0]
            : undefined,
          dateTo: statement.statementDateTo
            ? statement.statementDateTo.toISOString().split('T')[0]
            : undefined,
        },
      };
    }

    return this.statementRepository.save(statement);
  }

  async moveToTrash(id: string, userId: string): Promise<Statement> {
    const statement = await this.findOne(id, userId);
    await this.ensureCanModify(statement, userId);

    // Mark as deleted (soft delete)
    statement.deletedAt = new Date();
    await this.statementRepository.save(statement);

    // Log to audit
    await this.auditLogRepository.save({
      userId,
      action: AuditAction.STATEMENT_DELETE,
      description: `Moved statement to trash: ${statement.fileName}`,
      metadata: { statementId: id },
    });

    return statement;
  }

  async permanentDelete(id: string, userId: string): Promise<void> {
    const statement = await this.statementRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!statement) {
      throw new NotFoundException('Statement not found');
    }

    await this.ensureCanModify(statement, userId);

    // Log to audit before deletion
    await this.auditLogRepository.save({
      userId,
      action: AuditAction.STATEMENT_DELETE,
      description: `Permanently deleted statement: ${statement.fileName}`,
      metadata: { statementId: id },
    });

    // Delete all related transactions first
    await this.transactionRepository.delete({ statementId: id });

    // Delete file from filesystem
    if (fs.existsSync(statement.filePath)) {
      try {
        fs.unlinkSync(statement.filePath);
      } catch (error) {
        console.error(`Failed to delete file ${statement.filePath}:`, error);
        // Continue with statement deletion even if file deletion fails
      }
    }

    // Finally delete the statement
    await this.statementRepository.remove(statement);

    // Invalidate thumbnail cache
    await this.cacheManager.del(`statements:thumbnail:${id}`);
  }

  async remove(id: string, userId: string): Promise<void> {
    // For backward compatibility, remove now does soft delete
    await this.moveToTrash(id, userId);
  }

  async reprocess(id: string, userId: string): Promise<Statement> {
    const statement = await this.findOne(id, userId);
    await this.ensureCanModify(statement, userId);

    if (statement.status === StatementStatus.PROCESSING) {
      return statement;
    }

    // Clear previous parsing results to avoid duplicates on reprocess
    await this.transactionRepository.delete({ statementId: statement.id });

    statement.status = StatementStatus.UPLOADED;
    statement.errorMessage = null;
    statement.processedAt = null;
    statement.totalTransactions = 0;
    statement.totalDebit = 0;
    statement.totalCredit = 0;
    statement.categoryId = null;
    statement.parsingDetails = null;
    await this.statementRepository.save(statement);

    // Start processing asynchronously
    this.statementProcessingService.processStatement(statement.id).catch(error => {
      console.error('Error reprocessing statement:', error);
    });

    return statement;
  }

  async getFileStream(
    id: string,
    userId: string,
  ): Promise<{
    stream: NodeJS.ReadableStream;
    fileName: string;
    mimeType: string;
  }> {
    const statement = await this.findOne(id, userId);
    const { stream, fileName, mimeType } =
      await this.fileStorageService.getStatementFileStream(statement);
    return { stream, fileName, mimeType };
  }

  async restoreFile(id: string, userId: string) {
    const statement = await this.statementRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!statement) {
      throw new NotFoundException('Statement not found');
    }

    await this.ensureCanModify(statement, userId);

    // If the file is in trash, restore it from trash
    if (statement.deletedAt) {
      statement.deletedAt = null;
      await this.statementRepository.save(statement);

      // Log to audit
      await this.auditLogRepository.save({
        userId,
        action: AuditAction.STATEMENT_DELETE,
        description: `Restored statement from trash: ${statement.fileName}`,
        metadata: { statementId: id },
      });

      return { status: 'restored', source: 'trash' };
    }

    // Otherwise, restore file from database if it's missing from disk
    const restored = await this.fileStorageService.restoreFile(statement);
    if (!restored) {
      throw new NotFoundException('File data is unavailable for restore');
    }
    return { status: 'restored', source: restored.source };
  }

  async getThumbnail(id: string, userId: string): Promise<Buffer> {
    const statement = await this.findOne(id, userId);

    const cacheKey = `statements:thumbnail:${id}`;
    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) {
      return Buffer.from(cached, 'base64');
    }

    // Check if file is PDF
    if (statement.fileType !== 'pdf' && !statement.fileName.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Thumbnails are only available for PDF files');
    }

    // Determine source file path
    let pdfPath: string | null = null;
    let tempPdfPath: string | null = null;

    if (statement.filePath && fs.existsSync(statement.filePath)) {
      // Use existing file on disk
      pdfPath = statement.filePath;
    } else if (statement.fileData) {
      // Write data to temporary file
      tempPdfPath = path.join('/tmp', `temp-${statement.id}-${Date.now()}.pdf`);
      await fs.promises.writeFile(tempPdfPath, statement.fileData);
      pdfPath = tempPdfPath;
    }

    if (!pdfPath) {
      throw new NotFoundException('File data not available');
    }

    try {
      // Generate thumbnail using Python script
      const thumbnailPath = path.join('/tmp', `thumbnail-${statement.id}-${Date.now()}.png`);
      const scriptPath = path.join(__dirname, '../../../scripts/generate-thumbnail.py');
      const width = 200; // Thumbnail width in pixels

      // Execute Python script
      await execAsync(`python3 "${scriptPath}" "${pdfPath}" "${thumbnailPath}" ${width}`);

      // Read generated thumbnail
      const thumbnailData = await fs.promises.readFile(thumbnailPath);

      // Cache the thumbnail (1 week)
      await this.cacheManager.set(cacheKey, thumbnailData.toString('base64'), 604800);

      // Clean up temporary files
      try {
        await fs.promises.unlink(thumbnailPath);
        if (tempPdfPath) {
          await fs.promises.unlink(tempPdfPath);
        }
      } catch (cleanupError) {
        console.warn('Error cleaning up temporary files:', cleanupError);
      }

      return thumbnailData;
    } catch (error) {
      // Clean up temp PDF if it was created
      if (tempPdfPath) {
        try {
          await fs.promises.unlink(tempPdfPath);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }

      console.error('Error generating thumbnail:', error);
      throw new BadRequestException('Failed to generate thumbnail');
    }
  }
}
