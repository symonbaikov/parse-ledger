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
import { Statement, StatementStatus, FileType, BankName } from '../../entities/statement.entity';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { WorkspaceMember, WorkspaceRole } from '../../entities';
import { calculateFileHash } from '../../common/utils/file-hash.util';
import { getFileTypeFromMime } from '../../common/utils/file-validator.util';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import { StatementProcessingService } from '../parsing/services/statement-processing.service';
import { UpdateStatementDto } from './dto/update-statement.dto';
import { normalizeFilename } from '../../common/utils/filename.util';
import { FileStorageService } from '../../common/services/file-storage.service';

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
  ): Promise<Statement> {
    await this.ensureCanEditStatements(user.id);
    const normalizedName = normalizeFilename(file.originalname);
    const fileHash = await calculateFileHash(file.path);

    const duplicate = await this.statementRepository.findOne({
      where: { userId: user.id, fileHash },
    });

    if (duplicate) {
      throw new ConflictException('Statement already uploaded');
    }
    // Calculate file hash
    let fileData: Buffer | null = null;
    try {
      fileData = await fs.promises.readFile(file.path);
    } catch (error) {
      console.warn(`[Statements] Failed to read uploaded file for DB storage: ${(error as Error)?.message}`);
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
    if (fileData) {
      try {
        await this.statementRepository.update(savedStatement.id, { fileData });
      } catch (error) {
        console.warn(
          `[Statements] Failed to persist uploaded file in DB: ${(error as Error)?.message}`,
        );
      }
    }

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
    Promise.resolve(
      this.statementProcessingService.processStatement(savedStatement.id),
    ).catch(error => {
      console.error('Error processing statement:', error);
    });

    // Best-effort cleanup of temp file
    try {
      await fs.promises.unlink(file.path);
    } catch (cleanupError) {
      console.warn(`Failed to cleanup temp file ${file.path}:`, cleanupError);
    }

    return savedStatement;
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<Statement[]> {
    const workspaceId = await this.getWorkspaceId(userId);
    const where: any = {
      status: StatementStatus.PARSED,
      bankName: BankName.KASPI,
    };

    if (workspaceId) {
      where.user = { workspaceId } as any;
    } else {
      where.userId = userId;
    }

    return this.statementRepository.find({
      where,
      relations: ['transactions', 'user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Statement> {
    const workspaceId = await this.getWorkspaceId(userId);
    if (typeof (this.statementRepository as any).createQueryBuilder !== 'function') {
      const statement = await this.statementRepository.findOne({
        where: workspaceId
          ? [{ id, userId }, { id, user: { workspaceId } as any }]
          : { id, userId },
        relations: ['transactions', 'googleSheet', 'user'],
      } as any);

      if (!statement) {
        throw new NotFoundException('Statement not found');
      }

      return statement;
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
  ): Promise<{ stream: NodeJS.ReadableStream; fileName: string; mimeType: string }> {
    const statement = await this.findOne(id, userId);
    const { stream, fileName, mimeType } = await this.fileStorageService.getStatementFileStream(
      statement,
    );
    return { stream, fileName, mimeType };
  }
}
