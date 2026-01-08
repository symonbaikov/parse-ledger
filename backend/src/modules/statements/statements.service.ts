import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Statement, StatementStatus, FileType, BankName } from '../../entities/statement.entity';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { WorkspaceMember, WorkspaceRole } from '../../entities';
import { calculateFileHash } from '../../common/utils/file-hash.util';
import { getFileTypeFromMime } from '../../common/utils/file-validator.util';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import { StatementProcessingService } from '../parsing/services/statement-processing.service';
import { UpdateStatementDto } from './dto/update-statement.dto';

const uploadBaseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

const isRegularFile = (filePath: string): boolean => {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
};

const extractUploadsSuffix = (rawPath: string): string | null => {
  const normalized = rawPath.replace(/\\/g, '/');
  const marker = '/uploads/';
  const idx = normalized.lastIndexOf(marker);
  if (idx === -1) return null;
  const suffix = normalized.slice(idx + marker.length);
  return suffix ? suffix : null;
};

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
    private statementProcessingService: StatementProcessingService,
  ) {}

  private async getWorkspaceId(userId: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'workspaceId'],
    });
    return user?.workspaceId ?? null;
  }

  private async ensureCanModify(statement: Statement, userId: string): Promise<void> {
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
  ): Promise<Statement> {
    // Calculate file hash
    const fileHash = await calculateFileHash(file.path);

    // Check for duplicates
    const existingStatement = await this.statementRepository.findOne({
      where: { fileHash },
    });

    if (existingStatement) {
      // Return existing statement if duplicate found
      return existingStatement;
    }

    // Create new statement
    const statement = this.statementRepository.create({
      userId: user.id,
      googleSheetId: googleSheetId || null,
      fileName: file.originalname,
      filePath: file.path,
      fileType: getFileTypeFromMime(file.mimetype) as FileType,
      fileSize: file.size,
      fileHash,
      bankName: BankName.OTHER, // Will be determined during parsing
      status: StatementStatus.UPLOADED,
    });

    const savedStatement = (await this.statementRepository.save(statement)) as unknown as Statement;

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
    this.statementProcessingService.processStatement(savedStatement.id).catch(error => {
      console.error('Error processing statement:', error);
    });

    return savedStatement;
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Statement[]; total: number; page: number; limit: number }> {
    const workspaceId = await this.getWorkspaceId(userId);

    const qb = this.statementRepository
      .createQueryBuilder('statement')
      .leftJoinAndSelect('statement.googleSheet', 'googleSheet')
      .leftJoinAndSelect('statement.user', 'owner')
      .orderBy('statement.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (workspaceId) {
      qb.where('owner.workspaceId = :workspaceId', { workspaceId });
    } else {
      qb.where('statement.userId = :userId', { userId });
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<Statement> {
    const workspaceId = await this.getWorkspaceId(userId);

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

    return statement;
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

  async remove(id: string, userId: string): Promise<void> {
    const statement = await this.findOne(id, userId);
    await this.ensureCanModify(statement, userId);

    // Log to audit before deletion
    await this.auditLogRepository.save({
      userId,
      action: AuditAction.STATEMENT_DELETE,
      description: `Deleted statement: ${statement.fileName}`,
      metadata: { statementId: id },
    });

    // Delete all related transactions first
    await this.transactionRepository.delete({ statementId: id });

    // Delete file from filesystem
    const fs = require('fs');
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
  }

  async reprocess(id: string, userId: string): Promise<Statement> {
    const statement = await this.findOne(id, userId);
    await this.ensureCanModify(statement, userId);

    statement.status = StatementStatus.UPLOADED;
    statement.errorMessage = null;
    await this.statementRepository.save(statement);

    // Start processing asynchronously
    this.statementProcessingService.processStatement(statement.id).catch(error => {
      console.error('Error reprocessing statement:', error);
    });

    return statement;
  }

  private resolveFilePath(rawPath: string): string | null {
    const cwd = process.cwd();
    const dirFromModule = path.resolve(__dirname, '../../..'); // points to backend/dist
    const uploadsFromModule = path.resolve(__dirname, '../../../uploads');
    const uploadsFromModuleUp = path.resolve(__dirname, '../../../../uploads');
    const basename = path.basename(rawPath);
    const uploadsSuffix = extractUploadsSuffix(rawPath);

    const candidates = [
      rawPath,
      path.resolve(rawPath),
      path.isAbsolute(rawPath) ? rawPath : path.join(cwd, rawPath),
      path.join(cwd, 'dist', rawPath),
      path.join(cwd, '..', rawPath),
      path.join(uploadBaseDir, basename),
      path.join(uploadBaseDir, rawPath),
      uploadsSuffix ? path.join(uploadBaseDir, uploadsSuffix) : null,
      path.join(cwd, 'uploads', basename),
      path.join(cwd, 'uploads', rawPath),
      uploadsSuffix ? path.join(cwd, 'uploads', uploadsSuffix) : null,
      path.join(dirFromModule, 'uploads', basename),
      path.join(uploadsFromModule, basename),
      path.join(uploadsFromModuleUp, basename),
      path.join(path.dirname(rawPath), basename),
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
      if (isRegularFile(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  async getFilePath(id: string, userId: string): Promise<string> {
    const statement = await this.findOne(id, userId);

    const resolved = this.resolveFilePath(statement.filePath);
    if (!resolved) {
      throw new NotFoundException('File not found');
    }

    return resolved;
  }

  async getFileInfo(
    id: string,
    userId: string,
  ): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const statement = await this.findOne(id, userId);

    const resolved = this.resolveFilePath(statement.filePath);
    if (!resolved) throw new NotFoundException('File not found on disk');

    // Determine MIME type based on file type
    let mimeType = 'application/octet-stream';
    switch (statement.fileType) {
      case FileType.PDF:
        mimeType = 'application/pdf';
        break;
      case FileType.XLSX:
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case FileType.CSV:
        mimeType = 'text/csv';
        break;
      case FileType.IMAGE:
        mimeType = 'image/jpeg';
        break;
    }

    return {
      filePath: resolved,
      fileName: statement.fileName,
      mimeType,
    };
  }

  async getFileStream(
    id: string,
    userId: string,
  ): Promise<{ stream: fs.ReadStream; fileName: string; mimeType: string }> {
    const info = await this.getFileInfo(id, userId);
    const stream = fs.createReadStream(info.filePath);
    return { stream, fileName: info.fileName, mimeType: info.mimeType };
  }
}
