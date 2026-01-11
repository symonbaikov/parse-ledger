import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { FileType, Statement } from '../../entities';

export type FileAvailabilityStatus = 'both' | 'disk' | 'db' | 'missing';

export type FileAvailability = {
  onDisk: boolean;
  inDb: boolean;
  status: FileAvailabilityStatus;
};

const uploadBaseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

const extractUploadsSuffix = (rawPath: string): string | null => {
  const normalized = rawPath.replace(/\\/g, '/');
  const marker = '/uploads/';
  const idx = normalized.lastIndexOf(marker);
  if (idx === -1) return null;
  const suffix = normalized.slice(idx + marker.length);
  return suffix ? suffix : null;
};

const isRegularFile = (filePath: string): boolean => {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
};

@Injectable()
export class FileStorageService {
  constructor(
    @InjectRepository(Statement)
    private readonly statementRepository: Repository<Statement>,
  ) {}

  resolveFilePath(rawPath: string | null | undefined): string | null {
    if (!rawPath) return null;

    const cwd = process.cwd();
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
      path.join(__dirname, '../../..', 'uploads', basename), // dist/common/services -> dist/uploads
      path.join(__dirname, '../../../uploads', basename), // dist/common/services -> backend/uploads
      path.join(path.dirname(rawPath), basename),
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
      if (isRegularFile(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  isOnDisk(rawPath: string | null | undefined): boolean {
    return Boolean(this.resolveFilePath(rawPath));
  }

  getMimeType(fileType: FileType | string): string {
    const type = (fileType || '').toString().toLowerCase();
    switch (type) {
      case FileType.PDF:
      case 'pdf':
        return 'application/pdf';
      case FileType.XLSX:
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'xls':
        return 'application/vnd.ms-excel';
      case FileType.CSV:
      case 'csv':
        return 'text/csv';
      case FileType.IMAGE:
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }

  buildAvailability(onDisk: boolean, inDb: boolean): FileAvailability {
    const status: FileAvailabilityStatus = onDisk && inDb ? 'both' : onDisk ? 'disk' : inDb ? 'db' : 'missing';
    return { onDisk, inDb, status };
  }

  async getFileAvailability(statement: Pick<Statement, 'id' | 'filePath'>): Promise<FileAvailability> {
    const onDisk = this.isOnDisk(statement.filePath);
    const inDb = await this.hasFileData(statement.id);
    return this.buildAvailability(onDisk, inDb);
  }

  async getStatementsWithFileData(statementIds: string[]): Promise<Set<string>> {
    if (!statementIds.length) {
      return new Set();
    }

    const rows = await this.statementRepository
      .createQueryBuilder('statement')
      .select('statement.id', 'id')
      .where('statement.id IN (:...ids)', { ids: statementIds })
      .andWhere('statement.fileData IS NOT NULL')
      .getRawMany<{ id: string }>();

    return new Set(rows.map((row) => row.id));
  }

  async hasFileData(statementId: string): Promise<boolean> {
    const row = await this.statementRepository
      .createQueryBuilder('statement')
      .select('statement.id', 'id')
      .where('statement.id = :id', { id: statementId })
      .andWhere('statement.fileData IS NOT NULL')
      .getRawOne<{ id: string }>();

    return Boolean(row?.id);
  }

  private async getFileData(statementId: string): Promise<Buffer | null> {
    const withData = await this.statementRepository
      .createQueryBuilder('statement')
      .addSelect('statement.fileData')
      .where('statement.id = :id', { id: statementId })
      .getOne();

    return ((withData as any)?.fileData as Buffer | null | undefined) ?? null;
  }

  private async getFileDataByHash(params: {
    userId: string;
    fileHash: string;
    excludeStatementId?: string;
  }): Promise<Buffer | null> {
    const qb = this.statementRepository
      .createQueryBuilder('statement')
      .addSelect('statement.fileData')
      .where('statement.userId = :userId', { userId: params.userId })
      .andWhere('statement.fileHash = :fileHash', { fileHash: params.fileHash })
      .andWhere('statement.fileData IS NOT NULL')
      .orderBy('statement.createdAt', 'DESC');

    if (params.excludeStatementId) {
      qb.andWhere('statement.id <> :excludeId', { excludeId: params.excludeStatementId });
    }

    const other = await qb.getOne();
    return ((other as any)?.fileData as Buffer | null | undefined) ?? null;
  }

  async getStatementFileStream(statement: Pick<
    Statement,
    'id' | 'fileName' | 'filePath' | 'fileType' | 'fileHash' | 'userId'
  >): Promise<{
    stream: NodeJS.ReadableStream;
    fileName: string;
    mimeType: string;
    source: 'disk' | 'db';
  }> {
    const resolved = this.resolveFilePath(statement.filePath);
    if (resolved) {
      return {
        stream: fs.createReadStream(resolved),
        fileName: statement.fileName,
        mimeType: this.getMimeType(statement.fileType),
        source: 'disk',
      };
    }

    const fileData = await this.getFileData(statement.id);
    if (fileData) {
      return {
        stream: Readable.from(fileData),
        fileName: statement.fileName,
        mimeType: this.getMimeType(statement.fileType),
        source: 'db',
      };
    }

    if (statement.fileHash && statement.userId) {
      const alternative = await this.getFileDataByHash({
        userId: statement.userId,
        fileHash: statement.fileHash,
        excludeStatementId: statement.id,
      });

      if (alternative) {
        return {
          stream: Readable.from(alternative),
          fileName: statement.fileName,
          mimeType: this.getMimeType(statement.fileType),
          source: 'db',
        };
      }
    }

    throw new NotFoundException('File content is unavailable');
  }
}

