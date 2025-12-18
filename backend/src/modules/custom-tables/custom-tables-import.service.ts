import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AuditAction, AuditLog } from '../../entities/audit-log.entity';
import { Category } from '../../entities/category.entity';
import { CustomTable, CustomTableSource } from '../../entities/custom-table.entity';
import { CustomTableColumn, CustomTableColumnType } from '../../entities/custom-table-column.entity';
import { CustomTableRow } from '../../entities/custom-table-row.entity';
import { GoogleSheet } from '../../entities/google-sheet.entity';
import { GoogleSheetsApiService } from '../google-sheets/services/google-sheets-api.service';
import {
  GoogleSheetsImportLayoutType,
  GoogleSheetsImportPreviewDto,
} from './dto/google-sheets-import-preview.dto';
import { GoogleSheetsImportCommitDto, GoogleSheetsImportColumnDto } from './dto/google-sheets-import-commit.dto';

interface A1RangeBounds {
  sheetName: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

const columnLettersToNumber = (lettersRaw: string): number => {
  const letters = lettersRaw.toUpperCase();
  let num = 0;
  for (let i = 0; i < letters.length; i += 1) {
    const code = letters.charCodeAt(i);
    if (code < 65 || code > 90) continue;
    num = num * 26 + (code - 64);
  }
  return num;
};

const numberToColumnLetters = (numRaw: number): string => {
  let num = numRaw;
  if (num <= 0) return 'A';
  let letters = '';
  while (num > 0) {
    const rem = (num - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    num = Math.floor((num - 1) / 26);
  }
  return letters;
};

const unquoteSheetName = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  return trimmed;
};

const quoteSheetName = (value: string): string => {
  const escaped = value.replace(/'/g, "''");
  return `'${escaped}'`;
};

const parseA1Range = (rangeRaw: string): A1RangeBounds => {
  const match = rangeRaw.match(/^(.*?)!(\$?[A-Z]+)(\$?\d+)(?::(\$?[A-Z]+)(\$?\d+))?$/);
  if (!match) {
    throw new BadRequestException('Не удалось распарсить A1 range Google Sheets');
  }

  const sheetName = unquoteSheetName(match[1]);
  const startCol = columnLettersToNumber(match[2].replace(/\$/g, ''));
  const startRow = Number(match[3].replace(/\$/g, ''));
  const endCol = columnLettersToNumber((match[4] || match[2]).replace(/\$/g, ''));
  const endRow = Number((match[5] || match[3]).replace(/\$/g, ''));

  return { sheetName, startRow, startCol, endRow, endCol };
};

const normalizeCellValue = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
};

const isBooleanLike = (value: string): boolean => {
  const v = value.trim().toLowerCase();
  return ['true', 'false', 'yes', 'no', 'да', 'нет'].includes(v);
};

const isNumberLike = (value: string): boolean => {
  const normalized = value.replace(/\s+/g, '').replace(/,/g, '.');
  return /^-?\d+(\.\d+)?$/.test(normalized);
};

const isDateLike = (value: string): boolean => {
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return true;
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(v)) return true;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) return true;
  return false;
};

const inferColumnType = (values: Array<string | null>): CustomTableColumnType => {
  const cleaned = values
    .map((v) => (v === null ? null : v.trim()))
    .filter((v): v is string => Boolean(v && v.length));

  if (!cleaned.length) return CustomTableColumnType.TEXT;

  if (cleaned.every(isBooleanLike)) return CustomTableColumnType.BOOLEAN;
  if (cleaned.every(isNumberLike)) return CustomTableColumnType.NUMBER;
  if (cleaned.every(isDateLike)) return CustomTableColumnType.DATE;

  const distinct = new Set(cleaned.map((v) => v.toLowerCase()));
  if (cleaned.length >= 10 && distinct.size > 1 && distinct.size <= 12) {
    return CustomTableColumnType.SELECT;
  }

  return CustomTableColumnType.TEXT;
};

@Injectable()
export class CustomTablesImportService {
  private readonly logger = new Logger(CustomTablesImportService.name);

  constructor(
    @InjectRepository(GoogleSheet)
    private readonly googleSheetRepository: Repository<GoogleSheet>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CustomTable)
    private readonly customTableRepository: Repository<CustomTable>,
    @InjectRepository(CustomTableColumn)
    private readonly customTableColumnRepository: Repository<CustomTableColumn>,
    @InjectRepository(CustomTableRow)
    private readonly customTableRowRepository: Repository<CustomTableRow>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly googleSheetsApiService: GoogleSheetsApiService,
  ) {}

  private generateColumnKey(): string {
    const raw = uuidv4().replace(/-/g, '');
    return `col_${raw.slice(0, 12)}`;
  }

  private async log(userId: string, action: AuditAction, metadata?: Record<string, any>) {
    try {
      await this.auditLogRepository.save(
        this.auditLogRepository.create({
          userId,
          action,
          metadata: metadata || null,
        }),
      );
    } catch {
      this.logger.warn(`Audit log write failed for action=${action}`);
    }
  }

  private throwHelpfulSchemaError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const code = (error as any)?.driverError?.code;
      if (code === '42P01' || code === '42703') {
        throw new BadRequestException(
          'Схема БД не обновлена для Custom Tables. Запустите миграции (`npm -C backend run migration:run`) или включите автозапуск миграций (переменная окружения `RUN_MIGRATIONS=true`) и перезапустите backend.',
        );
      }
    }
    throw error;
  }

  private async resolveCategoryId(userId: string, categoryId: string): Promise<string> {
    let category: Category | null = null;
    try {
      category = await this.categoryRepository.findOne({ where: { id: categoryId, userId } });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!category) {
      throw new BadRequestException('Категория не найдена');
    }
    return category.id;
  }

  private async requireGoogleSheet(userId: string, googleSheetId: string): Promise<GoogleSheet> {
    const sheet = await this.googleSheetRepository.findOne({
      where: { id: googleSheetId, userId, isActive: true },
    });
    if (!sheet) {
      throw new NotFoundException('Google Sheet не найден или недоступен');
    }
    if (!sheet.refreshToken || sheet.refreshToken.includes('placeholder')) {
      throw new BadRequestException('Отсутствует refresh token Google. Подключите таблицу через OAuth.');
    }
    return sheet;
  }

  private async resolveWorksheetName(sheet: GoogleSheet, preferred?: string): Promise<string> {
    if (preferred && preferred.trim()) return preferred.trim();
    if (sheet.worksheetName && sheet.worksheetName.trim()) return sheet.worksheetName.trim();

    const info = await this.googleSheetsApiService.getSpreadsheetInfo(sheet.accessToken, sheet.sheetId);
    if (!info.firstWorksheet) {
      throw new BadRequestException('Не удалось определить лист Google Sheets');
    }
    return info.firstWorksheet;
  }

  private buildRange(worksheetName: string, range?: string): string {
    if (range && range.includes('!')) {
      return range;
    }

    const sheetRef = quoteSheetName(worksheetName);
    if (!range) {
      return sheetRef;
    }

    return `${sheetRef}!${range}`;
  }

  private detectLayout(values: unknown[][], headerRowIndex: number): GoogleSheetsImportLayoutType {
    const header = (values[headerRowIndex] || []).map((v) => normalizeCellValue(v)).filter(Boolean) as string[];
    const data = values.slice(headerRowIndex + 1, headerRowIndex + 1 + 20);

    const headerDateLikeCount = header.filter((v) => isDateLike(v)).length;
    const wide = header.length >= 12;

    let firstColNonEmpty = 0;
    for (const row of data) {
      const first = normalizeCellValue(row?.[0]);
      if (first) firstColNonEmpty += 1;
    }

    if (wide && headerDateLikeCount >= Math.max(5, Math.floor(header.length * 0.4)) && firstColNonEmpty >= 8) {
      return GoogleSheetsImportLayoutType.MATRIX;
    }

    return GoogleSheetsImportLayoutType.FLAT;
  }

  async previewGoogleSheets(userId: string, dto: GoogleSheetsImportPreviewDto) {
    const sheet = await this.requireGoogleSheet(userId, dto.googleSheetId);
    const worksheetName = await this.resolveWorksheetName(sheet, dto.worksheetName);
    const range = this.buildRange(worksheetName, dto.range);

    const { accessToken, values, range: effectiveRange } = await this.googleSheetsApiService.getValues(
      sheet.accessToken,
      sheet.refreshToken,
      sheet.sheetId,
      range,
      { valueRenderOption: 'FORMATTED_VALUE', dateTimeRenderOption: 'FORMATTED_STRING' },
    );

    if (accessToken !== sheet.accessToken) {
      sheet.accessToken = accessToken;
      await this.googleSheetRepository.save(sheet);
    }

    const bounds = parseA1Range(effectiveRange);
    const rowsCount = Math.max(bounds.endRow - bounds.startRow + 1, 0);
    const colsCount = Math.max(bounds.endCol - bounds.startCol + 1, 0);

    const headerRowIndex = dto.headerRowIndex ?? 0;
    const safeHeaderIndex = Math.min(Math.max(headerRowIndex, 0), Math.max(values.length - 1, 0));
    const layout = dto.layoutType && dto.layoutType !== GoogleSheetsImportLayoutType.AUTO ? dto.layoutType : this.detectLayout(values, safeHeaderIndex);

    const sampleRowCount = 10;
    const sample = values.slice(safeHeaderIndex + 1, safeHeaderIndex + 1 + sampleRowCount);

    const columns = Array.from({ length: colsCount }).map((_, idx) => {
      const colLetter = numberToColumnLetters(bounds.startCol + idx);
      const headerValue = normalizeCellValue(values?.[safeHeaderIndex]?.[idx]);
      const title = headerValue || colLetter;

      const sampleValues = sample.map((row) => normalizeCellValue(row?.[idx]));
      const suggestedType = inferColumnType(sampleValues);

      return {
        index: idx,
        a1: colLetter,
        title,
        suggestedType,
        include: true,
      };
    });

    return {
      spreadsheetId: sheet.sheetId,
      worksheetName,
      usedRange: {
        a1: effectiveRange,
        startRow: bounds.startRow,
        startCol: bounds.startCol,
        endRow: bounds.endRow,
        endCol: bounds.endCol,
        rowsCount,
        colsCount,
      },
      layoutSuggested: layout,
      headerRowIndex: safeHeaderIndex,
      sampleRows: sample.map((row, idx) => ({
        rowNumber: bounds.startRow + safeHeaderIndex + 1 + idx,
        values: Array.from({ length: colsCount }).map((_, colIdx) => normalizeCellValue(row?.[colIdx])),
      })),
      columns,
    };
  }

  private buildFinalColumns(
    previewColumns: Array<{ index: number; title: string; suggestedType: CustomTableColumnType }>,
    override?: GoogleSheetsImportColumnDto[],
  ) {
    if (!override || !override.length) {
      return previewColumns.map((c) => ({ ...c, include: true }));
    }

    const byIndex = new Map<number, GoogleSheetsImportColumnDto>();
    for (const item of override) {
      byIndex.set(item.index, item);
    }

    return previewColumns.map((base) => {
      const ovr = byIndex.get(base.index);
      return {
        index: base.index,
        title: ovr?.title?.trim() || base.title,
        suggestedType: ovr?.type || base.suggestedType,
        include: ovr?.include ?? true,
      };
    });
  }

  async commitGoogleSheets(userId: string, dto: GoogleSheetsImportCommitDto) {
    const sheet = await this.requireGoogleSheet(userId, dto.googleSheetId);
    const worksheetName = await this.resolveWorksheetName(sheet, dto.worksheetName);
    const range = this.buildRange(worksheetName, dto.range);

    const { accessToken, values, range: effectiveRange } = await this.googleSheetsApiService.getValues(
      sheet.accessToken,
      sheet.refreshToken,
      sheet.sheetId,
      range,
      { valueRenderOption: 'FORMATTED_VALUE', dateTimeRenderOption: 'FORMATTED_STRING' },
    );

    if (accessToken !== sheet.accessToken) {
      sheet.accessToken = accessToken;
      await this.googleSheetRepository.save(sheet);
    }

    const bounds = parseA1Range(effectiveRange);
    const rowsCount = Math.max(bounds.endRow - bounds.startRow + 1, 0);
    const colsCount = Math.max(bounds.endCol - bounds.startCol + 1, 0);

    const headerRowIndex = dto.headerRowIndex ?? 0;
    const safeHeaderIndex = Math.min(Math.max(headerRowIndex, 0), Math.max(values.length - 1, 0));

    const sampleForInference = values.slice(safeHeaderIndex + 1, safeHeaderIndex + 1 + 50);
    const previewColumns = Array.from({ length: colsCount }).map((_, idx) => {
      const colLetter = numberToColumnLetters(bounds.startCol + idx);
      const headerValue = normalizeCellValue(values?.[safeHeaderIndex]?.[idx]);
      const title = headerValue || colLetter;
      const inferred = inferColumnType(sampleForInference.map((row) => normalizeCellValue(row?.[idx])));
      return { index: idx, title, suggestedType: inferred, a1: colLetter };
    });

    const finalColumns = this.buildFinalColumns(
      previewColumns.map((c) => ({ index: c.index, title: c.title, suggestedType: c.suggestedType })),
      dto.columns,
    ).filter((c) => c.include);

    if (!finalColumns.length) {
      throw new BadRequestException('Нужно выбрать хотя бы одну колонку для импорта');
    }

    const categoryId =
      dto.categoryId === null || dto.categoryId === undefined
        ? null
        : await this.resolveCategoryId(userId, dto.categoryId);

    let table: CustomTable;
    try {
      table = await this.customTableRepository.save(
        this.customTableRepository.create({
          userId,
          name: dto.name.trim(),
          description: dto.description ?? null,
          source: CustomTableSource.GOOGLE_SHEETS_IMPORT,
          categoryId,
        }),
      );
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }

    await this.log(userId, AuditAction.CUSTOM_TABLE_CREATE, {
      tableId: table.id,
      source: 'google_sheets_import',
      spreadsheetId: sheet.sheetId,
      worksheetName,
      usedRange: effectiveRange,
    });

    let createdColumns: CustomTableColumn[];
    try {
      createdColumns = await this.customTableColumnRepository.save(
        finalColumns.map((col, position) => {
          const colLetter = previewColumns[col.index]?.a1 || numberToColumnLetters(bounds.startCol + col.index);
          return this.customTableColumnRepository.create({
            tableId: table.id,
            key: this.generateColumnKey(),
            title: col.title,
            type: col.suggestedType,
            isRequired: false,
            isUnique: false,
            position,
            config: {
              source: {
                kind: 'google_sheets',
                googleSheetId: sheet.id,
                spreadsheetId: sheet.sheetId,
                worksheetName,
                colIndex: col.index,
                colA1: colLetter,
                headerRow: bounds.startRow + safeHeaderIndex,
              },
            },
          });
        }),
      );
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }

    if (!dto.importData) {
      return {
        tableId: table.id,
        columnsCreated: createdColumns.length,
        rowsCreated: 0,
        usedRange: { a1: effectiveRange, rowsCount, colsCount },
      };
    }

    const keyByIndex = new Map<number, string>();
    createdColumns.forEach((col) => {
      const source = (col.config as any)?.source;
      if (source && typeof source.colIndex === 'number') {
        keyByIndex.set(source.colIndex, col.key);
      }
    });

    const dataStartIndex = safeHeaderIndex + 1;
    const rowsToInsert = [];
    for (let rowIdx = dataStartIndex; rowIdx < values.length; rowIdx += 1) {
      const sourceRowNumber = bounds.startRow + rowIdx;
      const rowValues = values[rowIdx] || [];
      const data: Record<string, any> = {};
      for (const col of finalColumns) {
        const key = keyByIndex.get(col.index);
        if (!key) continue;
        const cell = normalizeCellValue(rowValues?.[col.index]);
        if (cell !== null) {
          data[key] = cell;
        } else {
          data[key] = null;
        }
      }
      rowsToInsert.push(
        this.customTableRowRepository.create({
          tableId: table.id,
          rowNumber: sourceRowNumber,
          data,
        }),
      );
    }

    const chunkSize = 500;
    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
      const chunk = rowsToInsert.slice(i, i + chunkSize);
      try {
        await this.customTableRowRepository.save(chunk);
      } catch (error) {
        this.throwHelpfulSchemaError(error);
      }
      this.logger.log(`Imported rows ${i + 1}-${Math.min(i + chunkSize, rowsToInsert.length)} for table ${table.id}`);
    }

    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_BATCH_CREATE, {
      tableId: table.id,
      rowsCreated: rowsToInsert.length,
      spreadsheetId: sheet.sheetId,
      worksheetName,
      usedRange: effectiveRange,
    });

    return {
      tableId: table.id,
      columnsCreated: createdColumns.length,
      rowsCreated: rowsToInsert.length,
      usedRange: { a1: effectiveRange, rowsCount, colsCount },
    };
  }
}
