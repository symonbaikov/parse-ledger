import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, type Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AuditAction, AuditLog } from '../../entities/audit-log.entity';
import { Category } from '../../entities/category.entity';
import { CustomTableCellStyle } from '../../entities/custom-table-cell-style.entity';
import { CustomTableColumnStyle } from '../../entities/custom-table-column-style.entity';
import {
  CustomTableColumn,
  CustomTableColumnType,
} from '../../entities/custom-table-column.entity';
import { CustomTableRow } from '../../entities/custom-table-row.entity';
import { CustomTable, CustomTableSource } from '../../entities/custom-table.entity';
import { DataEntryCustomField } from '../../entities/data-entry-custom-field.entity';
import { DataEntry, DataEntryType } from '../../entities/data-entry.entity';
import { Statement } from '../../entities/statement.entity';
import { Transaction, TransactionType } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { WorkspaceMember, WorkspaceRole } from '../../entities/workspace-member.entity';
import type { BatchCreateCustomTableRowsDto } from './dto/batch-create-custom-table-rows.dto';
import type { CreateCustomTableColumnDto } from './dto/create-custom-table-column.dto';
import type { CreateCustomTableFromDataEntryCustomTabDto } from './dto/create-custom-table-from-data-entry-custom-tab.dto';
import {
  type CreateCustomTableFromDataEntryDto,
  DataEntryToCustomTableScope,
} from './dto/create-custom-table-from-data-entry.dto';
import type { CreateCustomTableFromStatementsDto } from './dto/create-custom-table-from-statements.dto';
import type { CreateCustomTableRowDto } from './dto/create-custom-table-row.dto';
import type { CreateCustomTableDto } from './dto/create-custom-table.dto';
import type { CustomTableRowFilterDto } from './dto/list-custom-table-rows.dto';
import type { ReorderCustomTableColumnsDto } from './dto/reorder-custom-table-columns.dto';
import type { UpdateCustomTableColumnDto } from './dto/update-custom-table-column.dto';
import type { UpdateCustomTableRowDto } from './dto/update-custom-table-row.dto';
import type { UpdateCustomTableViewSettingsColumnDto } from './dto/update-custom-table-view-settings.dto';
import type { UpdateCustomTableDto } from './dto/update-custom-table.dto';

type DataEntryFieldKey = 'date' | 'type' | 'amount' | 'currency' | 'note';

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
    @InjectRepository(CustomTableColumnStyle)
    private readonly customTableColumnStyleRepository: Repository<CustomTableColumnStyle>,
    @InjectRepository(CustomTableCellStyle)
    private readonly customTableCellStyleRepository: Repository<CustomTableCellStyle>,
    @InjectRepository(DataEntry)
    private readonly dataEntryRepository: Repository<DataEntry>,
    @InjectRepository(DataEntryCustomField)
    private readonly dataEntryCustomFieldRepository: Repository<DataEntryCustomField>,
    @InjectRepository(Statement)
    private readonly statementRepository: Repository<Statement>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
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

  private async getWorkspaceId(userId: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'workspaceId'],
    });
    return user?.workspaceId ?? null;
  }

  private async ensureCanEditCustomTables(userId: string): Promise<void> {
    const workspaceId = await this.getWorkspaceId(userId);
    if (!workspaceId) return;

    const membership = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId },
      select: ['role', 'permissions'],
    });

    if (!membership) return;
    if ([WorkspaceRole.ADMIN, WorkspaceRole.OWNER].includes(membership.role)) return;
    if (membership.permissions?.canEditCustomTables === false) {
      throw new ForbiddenException('Недостаточно прав для редактирования таблиц');
    }
  }

  private async resolveCategoryId(userId: string, categoryId: string): Promise<string> {
    let category: Category | null = null;
    try {
      const workspaceId = await this.getWorkspaceId(userId);
      const qb = this.categoryRepository
        .createQueryBuilder('category')
        .leftJoin('category.user', 'owner')
        .where('category.id = :categoryId', { categoryId });

      if (workspaceId) {
        qb.andWhere('(category.userId = :userId OR owner.workspaceId = :workspaceId)', {
          userId,
          workspaceId,
        });
      } else {
        qb.andWhere('category.userId = :userId', { userId });
      }

      category = await qb.getOne();
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!category) {
      throw new BadRequestException('Категория не найдена');
    }
    return category.id;
  }

  private async requireTable(userId: string, tableId: string): Promise<CustomTable> {
    const workspaceId = await this.getWorkspaceId(userId);
    try {
      const qb = this.customTableRepository
        .createQueryBuilder('table')
        .leftJoinAndSelect('table.user', 'owner')
        .where('table.id = :tableId', { tableId });

      if (workspaceId) {
        qb.andWhere('(table.userId = :userId OR owner.workspaceId = :workspaceId)', {
          userId,
          workspaceId,
        });
      } else {
        qb.andWhere('table.userId = :userId', { userId });
      }

      const table = await qb.getOne();
      if (!table) {
        throw new NotFoundException('Таблица не найдена');
      }
      return table;
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    throw new NotFoundException('Таблица не найдена');
  }

  private generateColumnKey(): string {
    const raw = uuidv4().replace(/-/g, '');
    return `col_${raw.slice(0, 12)}`;
  }

  private sanitizeRowData(
    data: Record<string, any>,
    allowedKeys: Set<string>,
  ): Record<string, any> {
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
    return new Set(columns.map(c => c.key));
  }

  private getDataEntryColumnMapping(columns: CustomTableColumn[]): {
    fieldKeyByName: Partial<Record<DataEntryFieldKey, string>>;
    customFieldKeyByName: Map<string, string>;
  } {
    const fieldKeyByName: Partial<Record<DataEntryFieldKey, string>> = {};
    const customFieldKeyByName = new Map<string, string>();
    const titleToField: Record<string, DataEntryFieldKey> = {
      дата: 'date',
      тип: 'type',
      сумма: 'amount',
      валюта: 'currency',
      комментарий: 'note',
    };

    for (const column of columns) {
      const config = column.config && typeof column.config === 'object' ? column.config : null;
      const source = config ? (config as any).source : null;
      if (source?.kind === 'data_entry_field' && source.field && !fieldKeyByName[source.field]) {
        fieldKeyByName[source.field as DataEntryFieldKey] = column.key;
      }
      if (
        source?.kind === 'data_entry_custom_tab' &&
        source.field &&
        !fieldKeyByName[source.field]
      ) {
        fieldKeyByName[source.field as DataEntryFieldKey] = column.key;
      }
      if (
        source?.kind === 'data_entry_custom_field' &&
        source.name &&
        !customFieldKeyByName.has(source.name)
      ) {
        customFieldKeyByName.set(source.name, column.key);
      }

      const normalizedTitle = column.title?.trim().toLowerCase();
      const fallbackField = normalizedTitle ? titleToField[normalizedTitle] : undefined;
      if (fallbackField && !fieldKeyByName[fallbackField]) {
        fieldKeyByName[fallbackField] = column.key;
      }
    }

    return { fieldKeyByName, customFieldKeyByName };
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
    await this.ensureCanEditCustomTables(userId);
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
      const workspaceId = await this.getWorkspaceId(userId);
      const qb = this.customTableRepository
        .createQueryBuilder('table')
        .leftJoinAndSelect('table.category', 'category')
        .leftJoin('table.user', 'owner')
        .orderBy('table.createdAt', 'DESC');

      if (workspaceId) {
        qb.where('owner.workspaceId = :workspaceId', { workspaceId });
      } else {
        qb.where('table.userId = :userId', { userId });
      }

      return await qb.getMany();
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
  }

  async getTable(userId: string, tableId: string): Promise<CustomTable> {
    await this.requireTable(userId, tableId);
    let table: CustomTable | null = null;
    try {
      table = await this.customTableRepository.findOne({
        where: { id: tableId },
        relations: { columns: true, category: true },
      });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!table) {
      throw new NotFoundException('Таблица не найдена');
    }

    table.columns = (table.columns || []).sort((a, b) => a.position - b.position);

    try {
      const styles = await this.customTableColumnStyleRepository.find({
        where: { tableId },
        select: ['columnKey', 'style'],
      });
      const byKey = new Map(styles.map(s => [s.columnKey, s.style]));
      table.columns.forEach(col => {
        (col as any).style = byKey.get(col.key) || null;
      });
    } catch (error) {
      this.logger.warn(`Failed to load column styles for tableId=${tableId}`);
    }

    return table;
  }

  async updateTable(
    userId: string,
    tableId: string,
    dto: UpdateCustomTableDto,
  ): Promise<CustomTable> {
    await this.ensureCanEditCustomTables(userId);
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
    await this.ensureCanEditCustomTables(userId);
    const selectedType = dto.scope === DataEntryToCustomTableScope.TYPE ? dto.type : undefined;

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

    const defaultName = selectedType
      ? `Ввод данных — ${typeLabels[selectedType] || selectedType}`
      : 'Ввод данных — все';
    const tableName = dto.name?.trim() || defaultName;
    const description = dto.description === undefined ? null : dto.description;

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
      {
        id: 'date',
        title: 'Дата',
        type: CustomTableColumnType.DATE,
        config: { source: { kind: 'data_entry_field', field: 'date' } },
      },
      ...(dto.scope === DataEntryToCustomTableScope.ALL
        ? [
            {
              id: 'type',
              title: 'Тип',
              type: CustomTableColumnType.TEXT,
              config: { source: { kind: 'data_entry_field', field: 'type' } },
            },
          ]
        : []),
      {
        id: 'amount',
        title: 'Сумма',
        type: CustomTableColumnType.NUMBER,
        config: { source: { kind: 'data_entry_field', field: 'amount' } },
      },
      {
        id: 'currency',
        title: 'Валюта',
        type: CustomTableColumnType.TEXT,
        config: { source: { kind: 'data_entry_field', field: 'currency' } },
      },
      {
        id: 'note',
        title: 'Комментарий',
        type: CustomTableColumnType.TEXT,
        config: { source: { kind: 'data_entry_field', field: 'note' } },
      },
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
          dataEntryScope: dto.scope,
          dataEntryType: selectedType || null,
          dataEntryCustomTabId: null,
          dataEntrySyncedAt: new Date(),
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
    await this.ensureCanEditCustomTables(userId);
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
          dataEntryScope: null,
          dataEntryType: null,
          dataEntryCustomTabId: customTab.id,
          dataEntrySyncedAt: new Date(),
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
      {
        id: 'date',
        title: 'Дата',
        type: CustomTableColumnType.DATE,
        config: {
          source: { kind: 'data_entry_custom_tab', customTabId: customTab.id, field: 'date' },
        },
      },
      {
        id: 'amount',
        title: 'Сумма',
        type: CustomTableColumnType.NUMBER,
        config: {
          source: { kind: 'data_entry_custom_tab', customTabId: customTab.id, field: 'amount' },
        },
      },
      {
        id: 'currency',
        title: 'Валюта',
        type: CustomTableColumnType.TEXT,
        config: {
          source: { kind: 'data_entry_custom_tab', customTabId: customTab.id, field: 'currency' },
        },
      },
      {
        id: 'note',
        title: 'Комментарий',
        type: CustomTableColumnType.TEXT,
        config: {
          source: { kind: 'data_entry_custom_tab', customTabId: customTab.id, field: 'note' },
        },
      },
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

  async syncFromDataEntry(
    userId: string,
    tableId: string,
  ): Promise<{ tableId: string; rowsCreated: number; syncedAt: Date }> {
    await this.ensureCanEditCustomTables(userId);
    let table: CustomTable | null = null;
    try {
      table = await this.customTableRepository.findOne({
        where: { id: tableId, userId },
        relations: { columns: true },
      });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!table) {
      throw new NotFoundException('Таблица не найдена');
    }

    const isCustomTab = Boolean(table.dataEntryCustomTabId);
    if (!isCustomTab && !table.dataEntryScope) {
      throw new BadRequestException('Таблица не связана с вводом данных');
    }

    let entries: DataEntry[];
    try {
      if (isCustomTab) {
        entries = await this.dataEntryRepository.find({
          where: { userId, customTabId: table.dataEntryCustomTabId },
          order: { date: 'ASC', createdAt: 'ASC' },
        });
      } else if (table.dataEntryScope === DataEntryToCustomTableScope.TYPE) {
        if (!table.dataEntryType) {
          throw new BadRequestException('Не указан тип для синхронизации');
        }
        entries = await this.dataEntryRepository.find({
          where: { userId, type: table.dataEntryType },
          order: { date: 'ASC', createdAt: 'ASC' },
        });
      } else {
        entries = await this.dataEntryRepository.find({
          where: { userId },
          order: { date: 'ASC', createdAt: 'ASC' },
        });
      }
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }

    const columns = (table.columns || []).sort((a, b) => a.position - b.position);
    const { fieldKeyByName, customFieldKeyByName } = this.getDataEntryColumnMapping(columns);

    const requiredFields: DataEntryFieldKey[] = ['date', 'amount', 'currency', 'note'];
    if (!isCustomTab && table.dataEntryScope === DataEntryToCustomTableScope.ALL) {
      requiredFields.push('type');
    }

    const missing = requiredFields.filter(field => !fieldKeyByName[field]);
    if (missing.length) {
      const labelByField: Record<DataEntryFieldKey, string> = {
        date: 'Дата',
        type: 'Тип',
        amount: 'Сумма',
        currency: 'Валюта',
        note: 'Комментарий',
      };
      const missingLabels = missing.map(field => labelByField[field]).join(', ');
      throw new BadRequestException(`Не найдены колонки для синхронизации: ${missingLabels}`);
    }

    const typeLabels: Record<DataEntryType, string> = {
      [DataEntryType.CASH]: 'Наличные',
      [DataEntryType.RAW]: 'Сырьё',
      [DataEntryType.DEBIT]: 'Дебет',
      [DataEntryType.CREDIT]: 'Кредит',
    };

    const rowsToInsert = entries.map((entry, idx) => {
      const data: Record<string, any> = {};
      const dateKey = fieldKeyByName.date;
      const amountKey = fieldKeyByName.amount;
      const currencyKey = fieldKeyByName.currency;
      const noteKey = fieldKeyByName.note;
      const typeKey = fieldKeyByName.type;

      if (dateKey) data[dateKey] = entry.date;
      if (amountKey) data[amountKey] = entry.amount;
      if (currencyKey) data[currencyKey] = entry.currency || 'KZT';
      if (noteKey) data[noteKey] = entry.note || null;

      if (!isCustomTab && table.dataEntryScope === DataEntryToCustomTableScope.ALL && typeKey) {
        data[typeKey] = typeLabels[entry.type] || entry.type;
      }

      const customName = entry.customFieldName?.trim();
      if (customName) {
        const customKey = customFieldKeyByName.get(customName);
        if (customKey) {
          data[customKey] = entry.customFieldValue ?? null;
        }
      }

      return {
        tableId: table.id,
        rowNumber: idx + 1,
        data,
      };
    });

    const syncedAt = new Date();
    await this.customTableRepository.manager.transaction(async manager => {
      await manager.delete(CustomTableRow, { tableId: table.id });
      const chunkSize = 500;
      for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
        const chunk = rowsToInsert.slice(i, i + chunkSize);
        if (chunk.length) {
          await manager.save(CustomTableRow, chunk);
        }
      }
      await manager.update(CustomTable, { id: table.id, userId }, {
        dataEntrySyncedAt: syncedAt,
      } as any);
    });

    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_BATCH_CREATE, {
      tableId: table.id,
      rowsCreated: rowsToInsert.length,
      source: 'data_entry_sync',
    });

    return { tableId: table.id, rowsCreated: rowsToInsert.length, syncedAt };
  }

  async createFromStatements(
    userId: string,
    dto: CreateCustomTableFromStatementsDto,
  ): Promise<{ tableId: string; columnsCreated: number; rowsCreated: number }> {
    await this.ensureCanEditCustomTables(userId);
    const statementIds = Array.from(
      new Set((dto.statementIds || []).map(v => String(v).trim()).filter(Boolean)),
    );
    if (!statementIds.length) {
      throw new BadRequestException('Выберите выписку');
    }
    if (statementIds.length > 10) {
      throw new BadRequestException('Слишком много выписок (лимит 10)');
    }

    let statements: Statement[];
    try {
      statements = await this.statementRepository.find({
        where: { id: In(statementIds), userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (statements.length !== statementIds.length) {
      throw new BadRequestException('Выписка не найдена');
    }

    let transactions: Transaction[];
    try {
      transactions = await this.transactionRepository.find({
        where: { statementId: In(statementIds) },
        order: { transactionDate: 'ASC', createdAt: 'ASC' } as any,
      });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    if (!transactions.length) {
      throw new BadRequestException('В выбранной выписке нет транзакций');
    }

    const defaultName =
      statements.length === 1
        ? `Выписка — ${statements[0]?.fileName || 'без названия'}`
        : `Выписки (${statements.length})`;
    const tableName = (dto.name?.trim() || defaultName).slice(0, 120);
    const description = dto.description === undefined ? null : dto.description;

    const includeStatementCol = statements.length > 1;

    const columnDefs: Array<{ id: string; title: string; type: CustomTableColumnType }> = [
      ...(includeStatementCol
        ? [{ id: 'statement', title: 'Выписка', type: CustomTableColumnType.TEXT }]
        : []),
      { id: 'date', title: 'Дата', type: CustomTableColumnType.DATE },
      { id: 'counterparty', title: 'Контрагент', type: CustomTableColumnType.TEXT },
      { id: 'purpose', title: 'Назначение', type: CustomTableColumnType.TEXT },
      { id: 'debit', title: 'Дебет', type: CustomTableColumnType.NUMBER },
      { id: 'credit', title: 'Кредит', type: CustomTableColumnType.NUMBER },
      { id: 'currency', title: 'Валюта', type: CustomTableColumnType.TEXT },
      { id: 'type', title: 'Тип', type: CustomTableColumnType.TEXT },
    ];

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
      source: 'statement_export',
      statementIds,
      rowsPlanned: transactions.length,
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
            config: null,
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
      if (def && col) keyByDefId.set(def.id, col.key);
    }

    const statementKey = keyByDefId.get('statement');
    const dateKey = keyByDefId.get('date');
    const counterpartyKey = keyByDefId.get('counterparty');
    const purposeKey = keyByDefId.get('purpose');
    const debitKey = keyByDefId.get('debit');
    const creditKey = keyByDefId.get('credit');
    const currencyKey = keyByDefId.get('currency');
    const typeKey = keyByDefId.get('type');

    if (
      !dateKey ||
      !counterpartyKey ||
      !purposeKey ||
      !debitKey ||
      !creditKey ||
      !currencyKey ||
      !typeKey
    ) {
      throw new BadRequestException('Не удалось сформировать колонки таблицы');
    }

    const statementNameById = new Map<string, string>();
    for (const s of statements) {
      statementNameById.set(s.id, s.fileName);
    }

    const typeLabel: Record<string, string> = {
      [TransactionType.INCOME]: 'Поступление',
      [TransactionType.EXPENSE]: 'Списание',
    };

    const rowsToInsert = transactions.map((tx, idx) => {
      const data: Record<string, any> = {};

      if (includeStatementCol && statementKey) {
        data[statementKey] = statementNameById.get(tx.statementId) || tx.statementId;
      }

      const date =
        tx.transactionDate instanceof Date
          ? tx.transactionDate.toISOString().slice(0, 10)
          : String(tx.transactionDate ?? '').slice(0, 10);
      data[dateKey] = date;
      data[counterpartyKey] = tx.counterpartyName || '';
      data[purposeKey] = tx.paymentPurpose || '';

      const asNumberOrNull = (value: unknown) => {
        if (value === null || value === undefined || value === '') return null;
        const n = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(n) ? n : null;
      };

      data[debitKey] = asNumberOrNull(tx.debit);
      data[creditKey] = asNumberOrNull(tx.credit);
      data[currencyKey] = tx.currency || 'KZT';
      data[typeKey] = typeLabel[tx.transactionType] || tx.transactionType;

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
      source: 'statement_export',
      statementIds,
    });

    return {
      tableId: table.id,
      columnsCreated: createdColumns.length,
      rowsCreated: rowsToInsert.length,
    };
  }

  async removeTable(userId: string, tableId: string): Promise<void> {
    await this.ensureCanEditCustomTables(userId);
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
    await this.ensureCanEditCustomTables(userId);
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
    await this.ensureCanEditCustomTables(userId);
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

  async reorderColumns(
    userId: string,
    tableId: string,
    dto: ReorderCustomTableColumnsDto,
  ): Promise<void> {
    await this.ensureCanEditCustomTables(userId);
    await this.requireTable(userId, tableId);
    let columns: CustomTableColumn[] = [];
    try {
      columns = await this.customTableColumnRepository.find({ where: { tableId } });
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    const existingIds = new Set(columns.map(c => c.id));
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
    await this.ensureCanEditCustomTables(userId);
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
    await this.log(userId, AuditAction.CUSTOM_TABLE_COLUMN_DELETE, {
      tableId,
      columnId,
      key: column.key,
    });
  }

  async listRows(
    userId: string,
    tableId: string,
    params: { cursor?: number; limit: number; filters?: CustomTableRowFilterDto[] },
  ): Promise<CustomTableRow[]> {
    await this.requireTable(userId, tableId);

    const query = this.customTableRowRepository
      .createQueryBuilder('r')
      .where('r.tableId = :tableId', { tableId })
      .orderBy('r.rowNumber', 'ASC')
      .addOrderBy('r.id', 'ASC')
      .take(params.limit);

    const rawFilters = params.filters?.filter(Boolean) || [];
    if (rawFilters.length) {
      if (rawFilters.length > 50) {
        throw new BadRequestException('Слишком много фильтров');
      }

      const columns = await this.customTableColumnRepository.find({
        where: { tableId },
        select: ['key', 'type'],
      });
      const typeByKey = new Map<string, CustomTableColumnType>(columns.map(c => [c.key, c.type]));

      rawFilters.forEach((filter, index) => {
        const col = filter?.col?.trim();
        const op = filter?.op;
        if (!col || !op) {
          throw new BadRequestException('Некорректный фильтр');
        }
        const columnType = typeByKey.get(col);
        if (!columnType) {
          throw new BadRequestException(`Колонка для фильтра не найдена: ${col}`);
        }

        const colParam = `f_col_${index}`;
        const valueParam = `f_val_${index}`;
        const valueParam2 = `f_val2_${index}`;
        const valuesParam = `f_vals_${index}`;

        const textExpr = `r.data ->> :${colParam}`;
        const textCoalescedExpr = `COALESCE(${textExpr}, '')`;
        const numericExpr = `(CASE WHEN ${textExpr} ~ '^\\s*-?\\d+(?:\\.\\d+)?\\s*$' THEN (${textExpr})::numeric ELSE NULL END)`;
        const dateExpr = `(CASE
          WHEN ${textExpr} ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN (${textExpr})::date
          WHEN ${textExpr} ~ '^\\d{2}\\.\\d{2}\\.\\d{4}$' THEN to_date(${textExpr}, 'DD.MM.YYYY')
          ELSE NULL
        END)`;
        const boolExpr = `(CASE
          WHEN lower(${textExpr}) IN ('true','t','1','yes','y') THEN true
          WHEN lower(${textExpr}) IN ('false','f','0','no','n') THEN false
          ELSE NULL
        END)`;

        const apply = (sql: string, paramsObj: Record<string, any>) => {
          query.andWhere(sql, paramsObj);
        };

        const withCol = (paramsObj: Record<string, any>) => ({ ...paramsObj, [colParam]: col });

        switch (op) {
          case 'isEmpty': {
            if (columnType === CustomTableColumnType.MULTI_SELECT) {
              apply(
                `(r.data -> :${colParam} IS NULL OR r.data -> :${colParam} = '[]'::jsonb)`,
                withCol({}),
              );
              break;
            }
            apply(`(${textExpr} IS NULL OR ${textExpr} = '')`, withCol({}));
            break;
          }
          case 'isNotEmpty': {
            if (columnType === CustomTableColumnType.MULTI_SELECT) {
              apply(
                `(r.data -> :${colParam} IS NOT NULL AND r.data -> :${colParam} <> '[]'::jsonb)`,
                withCol({}),
              );
              break;
            }
            apply(`(${textExpr} IS NOT NULL AND ${textExpr} <> '')`, withCol({}));
            break;
          }
          case 'contains': {
            const value =
              typeof filter.value === 'string'
                ? filter.value.trim()
                : String(filter.value ?? '').trim();
            if (!value) return;
            apply(
              `${textCoalescedExpr} ILIKE :${valueParam}`,
              withCol({ [valueParam]: `%${value}%` }),
            );
            break;
          }
          case 'startsWith': {
            const value =
              typeof filter.value === 'string'
                ? filter.value.trim()
                : String(filter.value ?? '').trim();
            if (!value) return;
            apply(
              `${textCoalescedExpr} ILIKE :${valueParam}`,
              withCol({ [valueParam]: `${value}%` }),
            );
            break;
          }
          case 'eq':
          case 'neq': {
            const isNeq = op === 'neq';
            if (columnType === CustomTableColumnType.NUMBER) {
              const value = Number(filter.value);
              if (!Number.isFinite(value)) return;
              apply(
                `${numericExpr} ${isNeq ? 'IS DISTINCT FROM' : '='} :${valueParam}`,
                withCol({ [valueParam]: value }),
              );
              break;
            }
            if (columnType === CustomTableColumnType.DATE) {
              const value =
                typeof filter.value === 'string'
                  ? filter.value.trim()
                  : String(filter.value ?? '').trim();
              if (!value) return;
              apply(
                `${dateExpr} ${isNeq ? 'IS DISTINCT FROM' : '='} :${valueParam}`,
                withCol({ [valueParam]: value }),
              );
              break;
            }
            if (columnType === CustomTableColumnType.BOOLEAN) {
              const raw =
                typeof filter.value === 'boolean'
                  ? filter.value
                  : String(filter.value ?? '').trim();
              if (raw === '') return;
              const value =
                typeof raw === 'boolean'
                  ? raw
                  : ['true', '1', 'yes', 'y', 't'].includes(raw.toLowerCase());
              apply(
                `${boolExpr} ${isNeq ? 'IS DISTINCT FROM' : '='} :${valueParam}`,
                withCol({ [valueParam]: value }),
              );
              break;
            }
            if (columnType === CustomTableColumnType.MULTI_SELECT) {
              const value =
                typeof filter.value === 'string'
                  ? filter.value.trim()
                  : String(filter.value ?? '').trim();
              if (!value) return;
              apply(
                `(CASE WHEN jsonb_typeof(r.data -> :${colParam}) = 'array'
                  THEN ${isNeq ? 'NOT ' : ''}EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(r.data -> :${colParam}) AS elem
                    WHERE elem = :${valueParam}
                  )
                  ELSE ${isNeq ? 'true' : 'false'} END)`,
                withCol({ [valueParam]: value }),
              );
              break;
            }
            {
              const value =
                typeof filter.value === 'string'
                  ? filter.value.trim()
                  : String(filter.value ?? '').trim();
              if (!value && value !== '') return;
              apply(
                `${textExpr} ${isNeq ? 'IS DISTINCT FROM' : '='} :${valueParam}`,
                withCol({ [valueParam]: value }),
              );
              break;
            }
          }
          case 'gt':
          case 'gte':
          case 'lt':
          case 'lte': {
            const cmp = op === 'gt' ? '>' : op === 'gte' ? '>=' : op === 'lt' ? '<' : '<=';
            if (columnType === CustomTableColumnType.NUMBER) {
              const value = Number(filter.value);
              if (!Number.isFinite(value)) return;
              apply(`${numericExpr} ${cmp} :${valueParam}`, withCol({ [valueParam]: value }));
              break;
            }
            if (columnType === CustomTableColumnType.DATE) {
              const value =
                typeof filter.value === 'string'
                  ? filter.value.trim()
                  : String(filter.value ?? '').trim();
              if (!value) return;
              apply(`${dateExpr} ${cmp} :${valueParam}`, withCol({ [valueParam]: value }));
              break;
            }
            throw new BadRequestException(
              `Оператор ${op} не поддерживается для типа ${columnType}`,
            );
          }
          case 'between': {
            const value = filter.value;
            const arr = Array.isArray(value) ? value : undefined;
            if (!arr || arr.length < 2) return;
            const [rawMin, rawMax] = arr;
            if (columnType === CustomTableColumnType.NUMBER) {
              const min = Number(rawMin);
              const max = Number(rawMax);
              if (!Number.isFinite(min) || !Number.isFinite(max)) return;
              apply(
                `${numericExpr} BETWEEN :${valueParam} AND :${valueParam2}`,
                withCol({ [valueParam]: min, [valueParam2]: max }),
              );
              break;
            }
            if (columnType === CustomTableColumnType.DATE) {
              const min = typeof rawMin === 'string' ? rawMin.trim() : String(rawMin ?? '').trim();
              const max = typeof rawMax === 'string' ? rawMax.trim() : String(rawMax ?? '').trim();
              if (!min || !max) return;
              apply(
                `${dateExpr} BETWEEN :${valueParam} AND :${valueParam2}`,
                withCol({ [valueParam]: min, [valueParam2]: max }),
              );
              break;
            }
            throw new BadRequestException(
              `Оператор between не поддерживается для типа ${columnType}`,
            );
          }
          case 'in': {
            const value = filter.value;
            const arr = Array.isArray(value)
              ? value
              : typeof value === 'string'
                ? value.split(',')
                : [];
            const values = arr.map(v => String(v).trim()).filter(Boolean);
            if (!values.length) return;

            if (columnType === CustomTableColumnType.MULTI_SELECT) {
              apply(
                `(CASE WHEN jsonb_typeof(r.data -> :${colParam}) = 'array'
                  THEN EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(r.data -> :${colParam}) AS elem
                    WHERE elem IN (:...${valuesParam})
                  )
                  ELSE false END)`,
                withCol({ [valuesParam]: values }),
              );
              break;
            }

            if (columnType === CustomTableColumnType.NUMBER) {
              const nums = values.map(v => Number(v)).filter(v => Number.isFinite(v));
              if (!nums.length) return;
              apply(`${numericExpr} IN (:...${valuesParam})`, withCol({ [valuesParam]: nums }));
              break;
            }

            apply(`${textExpr} IN (:...${valuesParam})`, withCol({ [valuesParam]: values }));
            break;
          }
          default:
            throw new BadRequestException(`Неизвестный оператор фильтра: ${op}`);
        }
      });
    }

    if (params.cursor !== undefined) {
      query.andWhere('r.rowNumber > :cursor', { cursor: params.cursor });
    }

    try {
      const rows = await query.getMany();
      if (!rows.length) return rows;

      try {
        const stylesByRowId = new Map<string, Record<string, any>>();
        rows.forEach(row => {
          if (row.styles && typeof row.styles === 'object') {
            stylesByRowId.set(row.id, row.styles as any);
          }
        });

        const rowIds = rows.map(r => r.id);
        const styles = await this.customTableCellStyleRepository.find({
          where: { rowId: In(rowIds) },
          select: ['rowId', 'columnKey', 'style'],
        });
        const byRow = new Map<string, Record<string, any>>();
        for (const s of styles) {
          const current = byRow.get(s.rowId) || {};
          current[s.columnKey] = s.style;
          byRow.set(s.rowId, current);
        }
        rows.forEach(row => {
          const merged = { ...(byRow.get(row.id) || {}) };
          const rowLevel = stylesByRowId.get(row.id);
          if (rowLevel) {
            Object.assign(merged, rowLevel);
          }
          (row as any).styles = merged;
        });
      } catch (error) {
        this.logger.warn(`Failed to load cell styles for tableId=${tableId}`);
      }

      return rows;
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
  }

  async createRow(
    userId: string,
    tableId: string,
    dto: CreateCustomTableRowDto,
  ): Promise<CustomTableRow> {
    await this.ensureCanEditCustomTables(userId);
    await this.requireTable(userId, tableId);
    const allowedKeys = await this.getAllowedColumnKeys(tableId);
    const data = this.sanitizeRowData(dto.data, allowedKeys);
    const rowNumber = dto.rowNumber ?? (await this.getNextRowNumber(tableId));

    const row = this.customTableRowRepository.create({
      tableId,
      rowNumber,
      data,
      styles: dto.styles ?? {},
    });
    let saved: CustomTableRow;
    try {
      saved = await this.customTableRowRepository.save(row);
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_CREATE, {
      tableId,
      rowId: saved.id,
      rowNumber: saved.rowNumber,
    });
    return saved;
  }

  async updateRow(
    userId: string,
    tableId: string,
    rowId: string,
    dto: UpdateCustomTableRowDto,
  ): Promise<CustomTableRow> {
    await this.ensureCanEditCustomTables(userId);
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
    if (dto.styles && typeof dto.styles === 'object') {
      row.styles = { ...(row.styles || {}), ...dto.styles };
    }

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
    await this.ensureCanEditCustomTables(userId);
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
    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_DELETE, {
      tableId,
      rowId,
      rowNumber: row.rowNumber,
    });
  }

  async batchCreateRows(
    userId: string,
    tableId: string,
    dto: BatchCreateCustomTableRowsDto,
  ): Promise<{ created: number }> {
    await this.ensureCanEditCustomTables(userId);
    await this.requireTable(userId, tableId);
    const allowedKeys = await this.getAllowedColumnKeys(tableId);

    let nextRowNumber = await this.getNextRowNumber(tableId);
    const rows = dto.rows.map(row => {
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
    await this.log(userId, AuditAction.CUSTOM_TABLE_ROW_BATCH_CREATE, {
      tableId,
      count: rows.length,
    });
    return { created: rows.length };
  }

  async updateViewSettingsColumn(
    userId: string,
    tableId: string,
    dto: UpdateCustomTableViewSettingsColumnDto,
  ): Promise<CustomTable> {
    await this.ensureCanEditCustomTables(userId);
    const table = await this.requireTable(userId, tableId);

    const columnKey = dto.columnKey?.trim();
    if (!columnKey) {
      throw new BadRequestException('columnKey обязателен');
    }

    const column = await this.customTableColumnRepository.findOne({
      where: { tableId, key: columnKey },
      select: ['id', 'key'],
    });
    if (!column) {
      throw new BadRequestException('Колонка не найдена');
    }

    const viewSettings = (
      table.viewSettings && typeof table.viewSettings === 'object' ? table.viewSettings : {}
    ) as Record<string, any>;
    const columns = (
      viewSettings.columns && typeof viewSettings.columns === 'object' ? viewSettings.columns : {}
    ) as Record<string, any>;
    const existing = (
      columns[columnKey] && typeof columns[columnKey] === 'object' ? columns[columnKey] : {}
    ) as Record<string, any>;
    const next = { ...existing };

    if (dto.width !== undefined) {
      next.width = dto.width;
    }

    columns[columnKey] = next;
    table.viewSettings = { ...viewSettings, columns };

    let saved: CustomTable;
    try {
      saved = await this.customTableRepository.save(table);
    } catch (error) {
      this.throwHelpfulSchemaError(error);
    }
    await this.log(userId, AuditAction.CUSTOM_TABLE_UPDATE, {
      tableId: saved.id,
      viewSettings: true,
    });
    return this.getTable(userId, tableId);
  }
}
