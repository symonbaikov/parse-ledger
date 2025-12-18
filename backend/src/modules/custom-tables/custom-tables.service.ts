import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AuditAction, AuditLog } from '../../entities/audit-log.entity';
import { Category } from '../../entities/category.entity';
import { CustomTable, CustomTableSource } from '../../entities/custom-table.entity';
import { CustomTableColumn, CustomTableColumnType } from '../../entities/custom-table-column.entity';
import { CustomTableRow } from '../../entities/custom-table-row.entity';
import { DataEntry, DataEntryType } from '../../entities/data-entry.entity';
import { DataEntryCustomField } from '../../entities/data-entry-custom-field.entity';
import { CreateCustomTableDto } from './dto/create-custom-table.dto';
import { UpdateCustomTableDto } from './dto/update-custom-table.dto';
import { CreateCustomTableColumnDto } from './dto/create-custom-table-column.dto';
import { UpdateCustomTableColumnDto } from './dto/update-custom-table-column.dto';
import { ReorderCustomTableColumnsDto } from './dto/reorder-custom-table-columns.dto';
import { CreateCustomTableRowDto } from './dto/create-custom-table-row.dto';
import { UpdateCustomTableRowDto } from './dto/update-custom-table-row.dto';
import { BatchCreateCustomTableRowsDto } from './dto/batch-create-custom-table-rows.dto';
import { CreateCustomTableFromDataEntryDto, DataEntryToCustomTableScope } from './dto/create-custom-table-from-data-entry.dto';
import { CreateCustomTableFromDataEntryCustomTabDto } from './dto/create-custom-table-from-data-entry-custom-tab.dto';

@Injectable()
export class CustomTablesService {
  private readonly logger = new Logger(CustomTablesService.name);

  constructor(
    @InjectRepository(CustomTable)
    private readonly customTableRepository: Repository<CustomTable>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CustomTableColumn)
    private readonly customTableColumnRepository: Repository<CustomTableColumn>,
    @InjectRepository(CustomTableRow)
    private readonly customTableRowRepository: Repository<CustomTableRow>,
    @InjectRepository(DataEntry)
    private readonly dataEntryRepository: Repository<DataEntry>,
    @InjectRepository(DataEntryCustomField)
    private readonly dataEntryCustomFieldRepository: Repository<DataEntryCustomField>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

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

  private async requireTable(userId: string, tableId: string): Promise<CustomTable> {
    let table: CustomTable | null = null;
    try {
      table = await this.customTableRepository.findOne({ where: { id: tableId, userId } });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!table) {
      throw new NotFoundException('Таблица не найдена');
    }
    return table;
  }

  private generateColumnKey(): string {
    const raw = uuidv4().replace(/-/g, '');
    return `col_${raw.slice(0, 12)}`;
  }

  private sanitizeRowData(data: Record<string, any>, allowedKeys: Set<string>): Record<string, any> {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return {};
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (allowedKeys.has(key)) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private async getAllowedColumnKeys(tableId: string): Promise<Set<string>> {
    const columns = await this.customTableColumnRepository.find({
      where: { tableId },
      select: ['key'],
    });
    return new Set(columns.map((c) => c.key));
  }

  private async getNextColumnPosition(tableId: string): Promise<number> {
    const raw = await this.customTableColumnRepository
      .createQueryBuilder('c')
      .select('MAX(c.position)', 'max')
      .where('c.tableId = :tableId', { tableId })
      .getRawOne<{ max: string | null }>();

    const max = raw?.max ? Number(raw.max) : 0;
    return Number.isFinite(max) ? max + 1 : 1;
  }

  private async getNextRowNumber(tableId: string): Promise<number> {
    const raw = await this.customTableRowRepository
      .createQueryBuilder('r')
      .select('MAX(r.rowNumber)', 'max')
      .where('r.tableId = :tableId', { tableId })
      .getRawOne<{ max: string | null }>();

    const max = raw?.max ? Number(raw.max) : 0;
    return Number.isFinite(max) ? max + 1 : 1;
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
    } catch (error) {
      this.logger.warn(`Audit log write failed for action=${action}`);
    }
  }

  async createTable(userId: string, dto: CreateCustomTableDto): Promise<CustomTable> {
    const categoryId =
      dto.categoryId === null || dto.categoryId === undefined
        ? null
        : await this.resolveCategoryId(userId, dto.categoryId);

    const table = this.customTableRepository.create({
      userId,
      name: dto.name,
      description: dto.description ?? null,
      source: CustomTableSource.MANUAL,
      categoryId,
    });

    let saved: CustomTable;
    try {
      saved = await this.customTableRepository.save(table);
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_CREATE, { tableId: saved.id });
    return saved;
  }

  async listTables(userId: string): Promise<CustomTable[]> {
    try {
      return await this.customTableRepository.find({
        where: { userId },
        relations: { category: true },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
  }

  async getTable(userId: string, tableId: string): Promise<CustomTable> {
    let table: CustomTable | null = null;
    try {
      table = await this.customTableRepository.findOne({
        where: { id: tableId, userId },
        relations: { columns: true, category: true },
      });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!table) {
      throw new NotFoundException('Таблица не найдена');
    }

    table.columns = (table.columns || []).sort((a, b) => a.position - b.position);
    return table;
  }

  async updateTable(userId: string, tableId: string, dto: UpdateCustomTableDto): Promise<CustomTable> {
    const table = await this.requireTable(userId, tableId);
    if (dto.name !== undefined) table.name = dto.name;
    if (dto.description !== undefined) table.description = dto.description ?? null;
    if (dto.categoryId !== undefined) {
      table.categoryId =
        dto.categoryId === null ? null : await this.resolveCategoryId(userId, dto.categoryId);
    }
    let saved: CustomTable;
    try {
      saved = await this.customTableRepository.save(table);
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_UPDATE, { tableId: saved.id });
    return saved;
  }

  async createFromDataEntry(
    userId: string,
    dto: CreateCustomTableFromDataEntryDto,
  ): Promise<{ tableId: string; columnsCreated: number; rowsCreated: number }> {
    const selectedType =
      dto.scope === DataEntryToCustomTableScope.TYPE ? dto.type : undefined;

    let entries: DataEntry[];
    try {
      entries = await this.dataEntryRepository.find({
        where: {
          userId,
          ...(selectedType ? { type: selectedType } : {}),
        },
        order: { date: 'ASC', createdAt: 'ASC' },
      });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }

    if (!entries.length) {
      throw new BadRequestException('Нет записей во «Ввод данных» для создания таблицы');
    }

    const typeLabels: Record<DataEntryType, string> = {
      [DataEntryType.CASH]: 'Наличные',
      [DataEntryType.RAW]: 'Сырьё',
      [DataEntryType.DEBIT]: 'Дебет',
      [DataEntryType.CREDIT]: 'Кредит',
    };

    const defaultName =
      selectedType
        ? `Ввод данных — ${typeLabels[selectedType] || selectedType}`
        : 'Ввод данных — все';
    const tableName = dto.name?.trim() || defaultName;
    const description =
      dto.description === undefined ? null : dto.description;

    const customFieldMetaByName = new Map<string, { icon: string | null }>();
    for (const entry of entries) {
      const name = entry.customFieldName?.trim();
      if (!name) continue;
      const icon = entry.customFieldIcon?.trim() || null;
      const existing = customFieldMetaByName.get(name);
      if (!existing) {
        customFieldMetaByName.set(name, { icon });
      } else if (!existing.icon && icon) {
        existing.icon = icon;
      }
    }

    const maxCustomColumns = 50;
    if (customFieldMetaByName.size > maxCustomColumns) {
      throw new BadRequestException(
        `Слишком много пользовательских колонок (${customFieldMetaByName.size}). Упростите названия или создайте таблицу по одной вкладке (лимит ${maxCustomColumns}).`,
      );
    }

    const columnDefs: Array<{
      id: string;
      title: string;
      type: CustomTableColumnType;
      config?: Record<string, any> | null;
    }> = [
      { id: 'date', title: 'Дата', type: CustomTableColumnType.DATE },
      ...(dto.scope === DataEntryToCustomTableScope.ALL
        ? [{ id: 'type', title: 'Тип', type: CustomTableColumnType.TEXT }]
        : []),
      { id: 'amount', title: 'Сумма', type: CustomTableColumnType.NUMBER },
      { id: 'currency', title: 'Валюта', type: CustomTableColumnType.TEXT },
      { id: 'note', title: 'Комментарий', type: CustomTableColumnType.TEXT },
    ];

    const customNames = Array.from(customFieldMetaByName.keys()).sort((a, b) =>
      a.localeCompare(b, 'ru'),
    );
    for (const name of customNames) {
      const meta = customFieldMetaByName.get(name);
      columnDefs.push({
        id: `custom:${name}`,
        title: name,
        type: CustomTableColumnType.TEXT,
        config: {
          ...(meta?.icon ? { icon: meta.icon } : {}),
          source: { kind: 'data_entry_custom_field', name },
        },
      });
    }

    let table: CustomTable;
    try {
      table = await this.customTableRepository.save(
        this.customTableRepository.create({
          userId,
          name: tableName,
          description,
          source: CustomTableSource.MANUAL,
          categoryId: null,
        }),
      );
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }

    await this.log(userId, AuditAction.CUSTOM_TABLE_CREATE, {
      tableId: table.id,
      source: 'data_entry_export',
      scope: dto.scope,
      type: selectedType || null,
      rowsPlanned: entries.length,
      customColumns: customNames.length,
    });

    let createdColumns: CustomTableColumn[];
    try {
      createdColumns = await this.customTableColumnRepository.save(
        columnDefs.map((def, position) =>
          this.customTableColumnRepository.create({
            tableId: table.id,
            key: this.generateColumnKey(),
            title: def.title,
            type: def.type,
            isRequired: false,
            isUnique: false,
            position,
            config: def.config ?? null,
          }),
        ),
      );
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }

    const keyByDefId = new Map<string, string>();
    for (let i = 0; i < createdColumns.length; i += 1) {
      const def = columnDefs[i];
      const col = createdColumns[i];
      if (def && col) {
        keyByDefId.set(def.id, col.key);
      }
    }

    const customKeyByName = new Map<string, string>();
    for (const name of customNames) {
      const key = keyByDefId.get(`custom:${name}`);
      if (key) {
        customKeyByName.set(name, key);
      }
    }

    const dateKey = keyByDefId.get('date');
    const typeKey = keyByDefId.get('type');
    const amountKey = keyByDefId.get('amount');
    const currencyKey = keyByDefId.get('currency');
    const noteKey = keyByDefId.get('note');

    if (!dateKey || !amountKey || !currencyKey || !noteKey) {
      throw new BadRequestException('Не удалось сформировать колонки таблицы');
    }

    const rowsToInsert = entries.map((entry, idx) => {
      const data: Record<string, any> = {};
      data[dateKey] = entry.date;
      data[amountKey] = entry.amount;
      data[currencyKey] = entry.currency || 'KZT';
      data[noteKey] = entry.note || null;

      if (dto.scope === DataEntryToCustomTableScope.ALL && typeKey) {
        data[typeKey] = typeLabels[entry.type] || entry.type;
      }

      const customName = entry.customFieldName?.trim();
      const customValue = entry.customFieldValue ?? null;
      if (customName && customValue !== null) {
        const key = customKeyByName.get(customName);
        if (key) {
          data[key] = customValue;
        }
      }

      return this.customTableRowRepository.create({
        tableId: table.id,
        rowNumber: idx + 1,
        data,
      });
    });

    const chunkSize = 500;
    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
      const chunk = rowsToInsert.slice(i, i + chunkSize);
      try {
        await this.customTableRowRepository.save(chunk);
      } catch (error) {
        this.throwHelpfulSchemaError(error);
      }
    }

    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_BATCH_CREATE, {
      tableId: table.id,
      rowsCreated: rowsToInsert.length,
      scope: dto.scope,
      type: selectedType || null,
    });

    return {
      tableId: table.id,
      columnsCreated: createdColumns.length,
      rowsCreated: rowsToInsert.length,
    };
  }

  async createFromDataEntryCustomTab(
    userId: string,
    dto: CreateCustomTableFromDataEntryCustomTabDto,
  ): Promise<{ tableId: string; columnsCreated: number; rowsCreated: number }> {
    let customTab: DataEntryCustomField | null = null;
    try {
      customTab = await this.dataEntryCustomFieldRepository.findOne({
        where: { id: dto.customTabId, userId },
      });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!customTab) {
      throw new BadRequestException('Пользовательская вкладка не найдена');
    }

    let entries: DataEntry[];
    try {
      entries = await this.dataEntryRepository.find({
        where: { userId, customTabId: customTab.id },
        order: { date: 'ASC', createdAt: 'ASC' },
      });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }

    if (!entries.length) {
      throw new BadRequestException('Нет записей в этой пользовательской вкладке');
    }

    const tableName = (dto.name?.trim() || customTab.name).slice(0, 120);
    const description = dto.description === undefined ? null : dto.description;

    let table: CustomTable;
    try {
      table = await this.customTableRepository.save(
        this.customTableRepository.create({
          userId,
          name: tableName,
          description,
          source: CustomTableSource.MANUAL,
          categoryId: null,
        }),
      );
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }

    await this.log(userId, AuditAction.CUSTOM_TABLE_CREATE, {
      tableId: table.id,
      source: 'data_entry_custom_tab_export',
      customTabId: customTab.id,
      rowsPlanned: entries.length,
    });

    const columnDefs: Array<{
      id: string;
      title: string;
      type: CustomTableColumnType;
      config?: Record<string, any> | null;
    }> = [
      { id: 'date', title: 'Дата', type: CustomTableColumnType.DATE },
      { id: 'amount', title: 'Сумма', type: CustomTableColumnType.NUMBER },
      { id: 'currency', title: 'Валюта', type: CustomTableColumnType.TEXT },
      { id: 'note', title: 'Комментарий', type: CustomTableColumnType.TEXT },
    ];

    let createdColumns: CustomTableColumn[];
    try {
      createdColumns = await this.customTableColumnRepository.save(
        columnDefs.map((def, position) =>
          this.customTableColumnRepository.create({
            tableId: table.id,
            key: this.generateColumnKey(),
            title: def.title,
            type: def.type,
            isRequired: false,
            isUnique: false,
            position,
            config: {
              ...(def.config ?? {}),
              source: {
                kind: 'data_entry_custom_tab',
                customTabId: customTab.id,
              },
            },
          }),
        ),
      );
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }

    const keyByDefId = new Map<string, string>();
    for (let i = 0; i < createdColumns.length; i += 1) {
      const def = columnDefs[i];
      const col = createdColumns[i];
      if (def && col) {
        keyByDefId.set(def.id, col.key);
      }
    }

    const dateKey = keyByDefId.get('date');
    const amountKey = keyByDefId.get('amount');
    const currencyKey = keyByDefId.get('currency');
    const noteKey = keyByDefId.get('note');

    if (!dateKey || !amountKey || !currencyKey || !noteKey) {
      throw new BadRequestException('Не удалось сформировать колонки таблицы');
    }

    const rowsToInsert = entries.map((entry, idx) => {
      const data: Record<string, any> = {};
      data[dateKey] = entry.date;
      data[amountKey] = entry.amount;
      data[currencyKey] = entry.currency || 'KZT';
      data[noteKey] = entry.note || null;
      return this.customTableRowRepository.create({
        tableId: table.id,
        rowNumber: idx + 1,
        data,
      });
    });

    const chunkSize = 500;
    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
      const chunk = rowsToInsert.slice(i, i + chunkSize);
      try {
        await this.customTableRowRepository.save(chunk);
      } catch (error) {
        this.throwHelpfulSchemaError(error);
      }
    }

    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_BATCH_CREATE, {
      tableId: table.id,
      rowsCreated: rowsToInsert.length,
      source: 'data_entry_custom_tab_export',
      customTabId: customTab.id,
    });

    return {
      tableId: table.id,
      columnsCreated: createdColumns.length,
      rowsCreated: rowsToInsert.length,
    };
  }

  async removeTable(userId: string, tableId: string): Promise<void> {
    const table = await this.requireTable(userId, tableId);
    try {
      await this.customTableRepository.delete({ id: table.id, userId });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_DELETE, { tableId });
  }

  async addColumn(
    userId: string,
    tableId: string,
    dto: CreateCustomTableColumnDto,
  ): Promise<CustomTableColumn> {
    await this.requireTable(userId, tableId);

    const position = dto.position ?? (await this.getNextColumnPosition(tableId));
    const column = this.customTableColumnRepository.create({
      tableId,
      key: this.generateColumnKey(),
      title: dto.title,
      type: dto.type ?? CustomTableColumnType.TEXT,
      isRequired: dto.isRequired ?? false,
      isUnique: dto.isUnique ?? false,
      position,
      config: dto.config ?? null,
    });

    let saved: CustomTableColumn;
    try {
      saved = await this.customTableColumnRepository.save(column);
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_COLUMN_CREATE, {
      tableId,
      columnId: saved.id,
      key: saved.key,
    });
    return saved;
  }

  async updateColumn(
    userId: string,
    tableId: string,
    columnId: string,
    dto: UpdateCustomTableColumnDto,
  ): Promise<CustomTableColumn> {
    await this.requireTable(userId, tableId);
    let column: CustomTableColumn | null = null;
    try {
      column = await this.customTableColumnRepository.findOne({ where: { id: columnId, tableId } });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!column) {
      throw new NotFoundException('Колонка не найдена');
    }

    if (dto.title !== undefined) column.title = dto.title;
    if (dto.type !== undefined) column.type = dto.type;
    if (dto.isRequired !== undefined) column.isRequired = dto.isRequired;
    if (dto.isUnique !== undefined) column.isUnique = dto.isUnique;
    if (dto.position !== undefined) column.position = dto.position;
    if (dto.config !== undefined) column.config = dto.config ?? null;

    let saved: CustomTableColumn;
    try {
      saved = await this.customTableColumnRepository.save(column);
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_COLUMN_UPDATE, { tableId, columnId });
    return saved;
  }

  async reorderColumns(userId: string, tableId: string, dto: ReorderCustomTableColumnsDto): Promise<void> {
    await this.requireTable(userId, tableId);
    let columns: CustomTableColumn[] = [];
    try {
      columns = await this.customTableColumnRepository.find({ where: { tableId } });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    const existingIds = new Set(columns.map((c) => c.id));
    for (const id of dto.columnIds) {
      if (!existingIds.has(id)) {
        throw new NotFoundException('Одна из колонок не найдена');
      }
    }

    const updates = dto.columnIds.map((id, idx) => ({ id, tableId, position: idx }));
    try {
      await this.customTableColumnRepository.save(updates);
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_COLUMN_REORDER, { tableId });
  }

  async removeColumn(userId: string, tableId: string, columnId: string): Promise<void> {
    await this.requireTable(userId, tableId);
    let column: CustomTableColumn | null = null;
    try {
      column = await this.customTableColumnRepository.findOne({ where: { id: columnId, tableId } });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!column) {
      throw new NotFoundException('Колонка не найдена');
    }
    try {
      await this.customTableColumnRepository.delete({ id: columnId, tableId });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_COLUMN_DELETE, { tableId, columnId, key: column.key });
  }

  async listRows(
    userId: string,
    tableId: string,
    params: { cursor?: number; limit: number },
  ): Promise<CustomTableRow[]> {
    await this.requireTable(userId, tableId);

    const query = this.customTableRowRepository
      .createQueryBuilder('r')
      .where('r.tableId = :tableId', { tableId })
      .orderBy('r.rowNumber', 'ASC')
      .addOrderBy('r.id', 'ASC')
      .take(params.limit);

    if (params.cursor !== undefined) {
      query.andWhere('r.rowNumber > :cursor', { cursor: params.cursor });
    }

    try {
      return await query.getMany();
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
  }

  async createRow(userId: string, tableId: string, dto: CreateCustomTableRowDto): Promise<CustomTableRow> {
    await this.requireTable(userId, tableId);
    const allowedKeys = await this.getAllowedColumnKeys(tableId);
    const data = this.sanitizeRowData(dto.data, allowedKeys);
    const rowNumber = dto.rowNumber ?? (await this.getNextRowNumber(tableId));

    const row = this.customTableRowRepository.create({ tableId, rowNumber, data });
    let saved: CustomTableRow;
    try {
      saved = await this.customTableRowRepository.save(row);
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_CREATE, { tableId, rowId: saved.id, rowNumber: saved.rowNumber });
    return saved;
  }

  async updateRow(
    userId: string,
    tableId: string,
    rowId: string,
    dto: UpdateCustomTableRowDto,
  ): Promise<CustomTableRow> {
    await this.requireTable(userId, tableId);
    let row: CustomTableRow | null = null;
    try {
      row = await this.customTableRowRepository.findOne({ where: { id: rowId, tableId } });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!row) {
      throw new NotFoundException('Строка не найдена');
    }

    const allowedKeys = await this.getAllowedColumnKeys(tableId);
    const patch = this.sanitizeRowData(dto.data, allowedKeys);
    row.data = { ...(row.data || {}), ...patch };

    let saved: CustomTableRow;
    try {
      saved = await this.customTableRowRepository.save(row);
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_UPDATE, { tableId, rowId });
    return saved;
  }

  async removeRow(userId: string, tableId: string, rowId: string): Promise<void> {
    await this.requireTable(userId, tableId);
    let row: CustomTableRow | null = null;
    try {
      row = await this.customTableRowRepository.findOne({ where: { id: rowId, tableId } });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!row) {
      throw new NotFoundException('Строка не найдена');
    }
    try {
      await this.customTableRowRepository.delete({ id: rowId, tableId });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_DELETE, { tableId, rowId, rowNumber: row.rowNumber });
  }

  async batchCreateRows(
    userId: string,
    tableId: string,
    dto: BatchCreateCustomTableRowsDto,
  ): Promise<{ created: number }> {
    await this.requireTable(userId, tableId);
    const allowedKeys = await this.getAllowedColumnKeys(tableId);

    let nextRowNumber = await this.getNextRowNumber(tableId);
    const rows = dto.rows.map((row) => {
      const rowNumber = row.rowNumber ?? nextRowNumber++;
      return this.customTableRowRepository.create({
        tableId,
        rowNumber,
        data: this.sanitizeRowData(row.data, allowedKeys),
      });
    });

    try {
      await this.customTableRowRepository.save(rows);
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_BATCH_CREATE, { tableId, count: rows.length });
    return { created: rows.length };
  }
}
