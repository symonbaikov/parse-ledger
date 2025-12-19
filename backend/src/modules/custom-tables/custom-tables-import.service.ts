import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AuditAction, AuditLog } from '../../entities/audit-log.entity';
import { Category } from '../../entities/category.entity';
import { CustomTable, CustomTableSource } from '../../entities/custom-table.entity';
import { CustomTableCellStyle } from '../../entities/custom-table-cell-style.entity';
import { CustomTableColumn, CustomTableColumnType } from '../../entities/custom-table-column.entity';
import { CustomTableColumnStyle } from '../../entities/custom-table-column-style.entity';
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

type SheetNumberFormat = { type: string; pattern?: string };
type SheetTextFormat = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  fontFamily?: string;
  foregroundColor?: string;
};
type SheetCellStyle = {
  backgroundColor?: string;
  horizontalAlignment?: string;
  verticalAlignment?: string;
  numberFormat?: SheetNumberFormat;
  textFormat?: SheetTextFormat;
};
type SheetCellStylePatch = {
  backgroundColor?: string | null;
  horizontalAlignment?: string | null;
  verticalAlignment?: string | null;
  numberFormat?: SheetNumberFormat | null;
  textFormat?: SheetTextFormat | null;
};

const clamp01 = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(1, n));
};

const toCssColor = (color: any): string | undefined => {
  if (!color || typeof color !== 'object') return undefined;
  const r = clamp01(color.red);
  const g = clamp01(color.green);
  const b = clamp01(color.blue);
  const a = clamp01(color.alpha);
  if (r === null && g === null && b === null) return undefined;
  const rr = Math.round((r ?? 0) * 255);
  const gg = Math.round((g ?? 0) * 255);
  const bb = Math.round((b ?? 0) * 255);
  const aa = a ?? 1;
  if (aa < 1) {
    return `rgba(${rr}, ${gg}, ${bb}, ${Math.max(0, Math.min(1, aa))})`;
  }
  const hex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${hex(rr)}${hex(gg)}${hex(bb)}`;
};

const extractSheetStyle = (format: any): SheetCellStyle => {
  if (!format || typeof format !== 'object') return {};
  const style: SheetCellStyle = {};

  const bg = toCssColor(format.backgroundColor);
  if (bg) style.backgroundColor = bg;

  if (typeof format.horizontalAlignment === 'string' && format.horizontalAlignment.trim()) {
    style.horizontalAlignment = format.horizontalAlignment.trim();
  }

  if (typeof format.verticalAlignment === 'string' && format.verticalAlignment.trim()) {
    style.verticalAlignment = format.verticalAlignment.trim();
  }

  const nf = format.numberFormat;
  if (nf && typeof nf === 'object' && typeof nf.type === 'string' && nf.type.trim()) {
    const parsed: SheetNumberFormat = { type: nf.type.trim() };
    if (typeof nf.pattern === 'string' && nf.pattern.trim()) {
      parsed.pattern = nf.pattern.trim();
    }
    style.numberFormat = parsed;
  }

  const tf = format.textFormat;
  if (tf && typeof tf === 'object') {
    const parsed: SheetTextFormat = {};

    if (typeof tf.bold === 'boolean') parsed.bold = tf.bold;
    if (typeof tf.italic === 'boolean') parsed.italic = tf.italic;
    if (typeof tf.underline === 'boolean') parsed.underline = tf.underline;
    if (typeof tf.strikethrough === 'boolean') parsed.strikethrough = tf.strikethrough;

    if (typeof tf.fontSize === 'number' && Number.isFinite(tf.fontSize) && tf.fontSize > 0) {
      parsed.fontSize = tf.fontSize;
    }

    if (typeof tf.fontFamily === 'string' && tf.fontFamily.trim()) {
      parsed.fontFamily = tf.fontFamily.trim();
    }

    const fg = toCssColor(tf.foregroundColor);
    if (fg) parsed.foregroundColor = fg;

    if (Object.keys(parsed).length) {
      style.textFormat = parsed;
    }
  }

  return style;
};

const isEmptyStyle = (style: Record<string, any> | null | undefined): boolean => {
  if (!style || typeof style !== 'object') return true;
  return Object.keys(style).length === 0;
};

const styleSignature = (style: SheetCellStyle): string => {
  const signature: Record<string, any> = {};
  if (style.backgroundColor !== undefined) signature.backgroundColor = style.backgroundColor;
  if (style.horizontalAlignment !== undefined) signature.horizontalAlignment = style.horizontalAlignment;
  if (style.verticalAlignment !== undefined) signature.verticalAlignment = style.verticalAlignment;
  if (style.numberFormat !== undefined) signature.numberFormat = style.numberFormat;
  if (style.textFormat !== undefined) signature.textFormat = style.textFormat;
  return JSON.stringify(signature);
};

const diffStyle = (base: SheetCellStyle, actual: SheetCellStyle): SheetCellStylePatch => {
  const patch: SheetCellStylePatch = {};
  const keys: Array<keyof SheetCellStyle> = [
    'backgroundColor',
    'horizontalAlignment',
    'verticalAlignment',
    'numberFormat',
    'textFormat',
  ];

  for (const key of keys) {
    const baseVal = base[key];
    const actualVal = actual[key];
    const baseHas = baseVal !== undefined;
    const actualHas = actualVal !== undefined;

    if (!baseHas && !actualHas) continue;

    if (!actualHas && baseHas) {
      (patch as any)[key] = null;
      continue;
    }

    if (actualHas) {
      const equal = JSON.stringify(baseVal) === JSON.stringify(actualVal);
      if (!baseHas || !equal) {
        (patch as any)[key] = actualVal as any;
      }
    }
  }

  return patch;
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
    @InjectRepository(CustomTableColumnStyle)
    private readonly customTableColumnStyleRepository: Repository<CustomTableColumnStyle>,
    @InjectRepository(CustomTableCellStyle)
    private readonly customTableCellStyleRepository: Repository<CustomTableCellStyle>,
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

  async executeGoogleSheetsCommit(
    userId: string,
    dto: GoogleSheetsImportCommitDto,
    opts?: { onProgress?: (progress: number, stage?: string) => void | Promise<void> },
  ) {
    const report = async (progress: number, stage?: string) => {
      try {
        await opts?.onProgress?.(Math.max(0, Math.min(100, Math.floor(progress))), stage);
      } catch {
        // ignore
      }
    };

    await report(1, 'reading_values');
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

    await report(5, 'creating_table');
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

    const keyByIndex = new Map<number, string>();
    createdColumns.forEach((col) => {
      const source = (col.config as any)?.source;
      if (source && typeof source.colIndex === 'number') {
        keyByIndex.set(source.colIndex, col.key);
      }
    });

    let gridRowData: any[] | null = null;
    const baseStyleByIndex = new Map<number, SheetCellStyle>();

    try {
      const grid = await this.googleSheetsApiService.getGridData(
        sheet.accessToken,
        sheet.refreshToken,
        sheet.sheetId,
        effectiveRange,
      );

      if (grid.accessToken !== sheet.accessToken) {
        sheet.accessToken = grid.accessToken;
        await this.googleSheetRepository.save(sheet);
      }

      const spreadsheet = grid.spreadsheet;
      const sheetEntry =
        spreadsheet?.sheets?.find((s: any) => s?.properties?.title === worksheetName) || spreadsheet?.sheets?.[0];
      const dataEntry = sheetEntry?.data?.[0];
      gridRowData = Array.isArray(dataEntry?.rowData) ? dataEntry.rowData : null;
      const columnMetadata = Array.isArray(dataEntry?.columnMetadata) ? dataEntry.columnMetadata : null;

      if (columnMetadata && columnMetadata.length) {
        try {
          const current = table.viewSettings && typeof table.viewSettings === 'object' ? table.viewSettings : {};
          const viewSettings: Record<string, any> = { ...(current || {}) };
          const columnsSettings: Record<string, any> = {
            ...(viewSettings.columns && typeof viewSettings.columns === 'object' ? viewSettings.columns : {}),
          };

          let changed = false;
          for (const [colIndex, columnKey] of keyByIndex.entries()) {
            const width = columnMetadata?.[colIndex]?.pixelSize;
            if (!(typeof width === 'number' && Number.isFinite(width) && width > 0)) continue;
            const existing = columnsSettings[columnKey] && typeof columnsSettings[columnKey] === 'object' ? columnsSettings[columnKey] : {};
            if (existing.width !== width) {
              columnsSettings[columnKey] = { ...existing, width };
              changed = true;
            }
          }

          if (changed) {
            viewSettings.columns = columnsSettings;
            table.viewSettings = viewSettings;
            await this.customTableRepository.update({ id: table.id }, { viewSettings } as any);
          }
        } catch {
          this.logger.warn(`Google Sheets column width import skipped for tableId=${table.id}`);
        }
      }

      if (gridRowData && gridRowData.length) {
        const rowLimit = Math.min(gridRowData.length, values.length);
        const columnStyleEntities: CustomTableColumnStyle[] = [];

        for (const [colIndex, columnKey] of keyByIndex.entries()) {
          const headerFormat = gridRowData?.[safeHeaderIndex]?.values?.[colIndex]?.userEnteredFormat;
          const headerStyle = extractSheetStyle(headerFormat);

          const counts = new Map<string, { count: number; style: SheetCellStyle }>();
          for (let rowIdx = safeHeaderIndex + 1; rowIdx < rowLimit; rowIdx += 1) {
            const format = gridRowData?.[rowIdx]?.values?.[colIndex]?.userEnteredFormat;
            const style = extractSheetStyle(format);
            const sig = styleSignature(style);
            const existing = counts.get(sig);
            if (existing) {
              existing.count += 1;
            } else {
              counts.set(sig, { count: 1, style });
            }
          }

          let baseStyle: SheetCellStyle = {};
          let bestCount = -1;
          for (const entry of counts.values()) {
            if (entry.count > bestCount) {
              bestCount = entry.count;
              baseStyle = entry.style;
            }
          }

          baseStyleByIndex.set(colIndex, baseStyle);

          const payload: Record<string, any> = {};
          if (!isEmptyStyle(headerStyle)) payload.header = headerStyle;
          if (!isEmptyStyle(baseStyle)) payload.cell = baseStyle;
          if (Object.keys(payload).length) {
            columnStyleEntities.push(
              this.customTableColumnStyleRepository.create({
                tableId: table.id,
                columnKey,
                style: payload,
              }),
            );
          }
        }

        if (columnStyleEntities.length) {
          await this.customTableColumnStyleRepository.save(columnStyleEntities);
        }
      }
    } catch (error) {
      this.logger.warn(`Google Sheets style import skipped for tableId=${table.id}`);
    }

    if (!dto.importData) {
      await report(100, 'done');
      return {
        tableId: table.id,
        columnsCreated: createdColumns.length,
        rowsCreated: 0,
        usedRange: { a1: effectiveRange, rowsCount, colsCount },
      };
    }

    await report(10, 'importing_rows');
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
      rowsToInsert.push({
        tableId: table.id,
        rowNumber: sourceRowNumber,
        data,
      });
    }

    const chunkSize = 500;
    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
      const chunk = rowsToInsert.slice(i, i + chunkSize);
      try {
        await this.customTableRowRepository
          .createQueryBuilder()
          .insert()
          .into(CustomTableRow)
          .values(chunk)
          .execute();
      } catch (error) {
        this.throwHelpfulSchemaError(error);
      }
      this.logger.log(`Imported rows ${i + 1}-${Math.min(i + chunkSize, rowsToInsert.length)} for table ${table.id}`);
      const fraction = rowsToInsert.length ? Math.min(1, (i + chunk.length) / rowsToInsert.length) : 1;
      await report(10 + fraction * 70, 'importing_rows');
    }

    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_BATCH_CREATE, {
      tableId: table.id,
      rowsCreated: rowsToInsert.length,
      spreadsheetId: sheet.sheetId,
      worksheetName,
      usedRange: effectiveRange,
    });

    await report(82, 'loading_styles');
    let rowIdByRowNumber = new Map<number, string>();
    try {
      if (rowsToInsert.length) {
        const minRow = rowsToInsert[0].rowNumber;
        const maxRow = rowsToInsert[rowsToInsert.length - 1].rowNumber;
        const existingRows = await this.customTableRowRepository
          .createQueryBuilder('r')
          .select(['r.id', 'r.rowNumber'])
          .where('r.tableId = :tableId', { tableId: table.id })
          .andWhere('r.rowNumber BETWEEN :minRow AND :maxRow', { minRow, maxRow })
          .getMany();
        rowIdByRowNumber = new Map(existingRows.map((r) => [r.rowNumber, r.id]));
      }
    } catch (error) {
      this.logger.warn(`Failed to build rowId map for tableId=${table.id}`);
    }

    if (gridRowData && gridRowData.length && keyByIndex.size) {
      try {
        const rowLimit = Math.min(gridRowData.length, values.length);
        const cellCount = Math.max(0, rowLimit - dataStartIndex) * keyByIndex.size;
        const MAX_CELL_STYLE_INSERTS = 50_000;
        if (cellCount > MAX_CELL_STYLE_INSERTS) {
          this.logger.warn(
            `Google Sheets cell style import skipped for tableId=${table.id} (cells=${cellCount} > ${MAX_CELL_STYLE_INSERTS})`,
          );
          return {
            tableId: table.id,
            columnsCreated: createdColumns.length,
            rowsCreated: rowsToInsert.length,
            usedRange: { a1: effectiveRange, rowsCount, colsCount },
          };
        }

        const cellStyleEntities: CustomTableCellStyle[] = [];

        for (let rowIdx = dataStartIndex; rowIdx < rowLimit; rowIdx += 1) {
          const rowNumber = bounds.startRow + rowIdx;
          const rowId = rowIdByRowNumber.get(rowNumber);
          if (!rowId) continue;
          for (const [colIndex, columnKey] of keyByIndex.entries()) {
            const baseStyle = baseStyleByIndex.get(colIndex) || {};
            const format = gridRowData?.[rowIdx]?.values?.[colIndex]?.userEnteredFormat;
            const actualStyle = extractSheetStyle(format);
            const patch = diffStyle(baseStyle, actualStyle);
            if (Object.keys(patch).length === 0) continue;
            cellStyleEntities.push({ id: uuidv4(), rowId, columnKey, style: patch } as any);
          }
        }

        const chunkSizeStyles = 1000;
        for (let i = 0; i < cellStyleEntities.length; i += chunkSizeStyles) {
          const chunk = cellStyleEntities.slice(i, i + chunkSizeStyles);
          try {
            await this.customTableCellStyleRepository
              .createQueryBuilder()
              .insert()
              .into(CustomTableCellStyle)
              .values(chunk as any)
              .execute();
          } catch (error) {
            this.throwHelpfulSchemaError(error);
          }
          const fraction = cellStyleEntities.length ? Math.min(1, (i + chunk.length) / cellStyleEntities.length) : 1;
          await report(85 + fraction * 10, 'saving_styles');
        }
      } catch (error) {
        this.logger.warn(`Google Sheets cell style import failed for tableId=${table.id}: ${error instanceof Error ? error.message : 'unknown error'}`);
      }
    }

    await report(100, 'done');
    return {
      tableId: table.id,
      columnsCreated: createdColumns.length,
      rowsCreated: rowsToInsert.length,
      usedRange: { a1: effectiveRange, rowsCount, colsCount },
    };
  }

  async commitGoogleSheets(userId: string, dto: GoogleSheetsImportCommitDto) {
    return this.executeGoogleSheetsCommit(userId, dto);
  }
}
