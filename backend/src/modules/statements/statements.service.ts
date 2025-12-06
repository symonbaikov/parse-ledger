import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Statement, StatementStatus, FileType, BankName } from '../../entities/statement.entity';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { calculateFileHash } from '../../common/utils/file-hash.util';
import { getFileTypeFromMime } from '../../common/utils/file-validator.util';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import { StatementProcessingService } from '../parsing/services/statement-processing.service';

@Injectable()
export class StatementsService {
  constructor(
    @InjectRepository(Statement)
    private statementRepository: Repository<Statement>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private statementProcessingService: StatementProcessingService,
  ) {}

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
    const [data, total] = await this.statementRepository.findAndCount({
      where: { userId },
      relations: ['googleSheet'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<Statement> {
    const statement = await this.statementRepository.findOne({
      where: { id, userId },
      relations: ['transactions', 'googleSheet'],
    });

    if (!statement) {
      throw new NotFoundException('Statement not found');
    }

    return statement;
  }

  async remove(id: string, userId: string): Promise<void> {
    const statement = await this.findOne(id, userId);

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

    statement.status = StatementStatus.UPLOADED;
    statement.errorMessage = null;
    await this.statementRepository.save(statement);

    // Start processing asynchronously
    this.statementProcessingService.processStatement(statement.id).catch(error => {
      console.error('Error reprocessing statement:', error);
    });

    return statement;
  }

  async getFilePath(id: string, userId: string): Promise<string> {
    const statement = await this.findOne(id, userId);

    if (!fs.existsSync(statement.filePath)) {
      throw new NotFoundException('File not found');
    }

    return path.resolve(statement.filePath);
  }

  async getFileInfo(
    id: string,
    userId: string,
  ): Promise<{ filePath: string; fileName: string; mimeType: string }> {
    const statement = await this.findOne(id, userId);

    if (!fs.existsSync(statement.filePath)) {
      throw new NotFoundException('File not found');
    }

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
      filePath: path.resolve(statement.filePath),
      fileName: statement.fileName,
      mimeType,
    };
  }
}
