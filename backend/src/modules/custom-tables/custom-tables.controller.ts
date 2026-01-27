import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CustomTableImportJobsService } from './custom-table-import-jobs.service';
import { CustomTablesCacheService } from './custom-tables-cache.service';
import { CustomTablesImportService } from './custom-tables-import.service';
import { CustomTablesService } from './custom-tables.service';
import { BatchCreateCustomTableRowsDto } from './dto/batch-create-custom-table-rows.dto';
import { ClassifyPaidStatusDto } from './dto/classify-paid-status.dto';
import { CreateCustomTableColumnDto } from './dto/create-custom-table-column.dto';
import { CreateCustomTableFromDataEntryCustomTabDto } from './dto/create-custom-table-from-data-entry-custom-tab.dto';
import { CreateCustomTableFromDataEntryDto } from './dto/create-custom-table-from-data-entry.dto';
import { CreateCustomTableFromStatementsDto } from './dto/create-custom-table-from-statements.dto';
import { CreateCustomTableRowDto } from './dto/create-custom-table-row.dto';
import { CreateCustomTableDto } from './dto/create-custom-table.dto';
import { GoogleSheetsImportCommitDto } from './dto/google-sheets-import-commit.dto';
import { GoogleSheetsImportPreviewDto } from './dto/google-sheets-import-preview.dto';
import { CustomTableRowFilterDto } from './dto/list-custom-table-rows.dto';
import { ReorderCustomTableColumnsDto } from './dto/reorder-custom-table-columns.dto';
import { UpdateCustomTableColumnDto } from './dto/update-custom-table-column.dto';
import { UpdateCustomTableRowDto } from './dto/update-custom-table-row.dto';
import { UpdateCustomTableViewSettingsColumnDto } from './dto/update-custom-table-view-settings.dto';
import { UpdateCustomTableDto } from './dto/update-custom-table.dto';

@Controller('custom-tables')
@UseGuards(JwtAuthGuard)
export class CustomTablesController {
  constructor(
    private readonly customTablesService: CustomTablesService,
    private readonly customTablesImportService: CustomTablesImportService,
    private readonly importJobsService: CustomTableImportJobsService,
    private readonly customTablesCache: CustomTablesCacheService,
  ) {}

  @Post()
  async createTable(@CurrentUser() user: User, @Body() dto: CreateCustomTableDto) {
    const table = await this.customTablesService.createTable(user.id, dto);
    await this.customTablesCache.bumpList(user.id);
    return table;
  }

  @Get()
  async listTables(@CurrentUser() user: User) {
    const cacheKey = await this.customTablesCache.listKey(user.id);
    return this.customTablesCache.getOrSet(cacheKey, async () => {
      const items = await this.customTablesService.listTables(user.id);
      return { items };
    });
  }

  @Post('import/google-sheets/preview')
  async previewGoogleSheets(@CurrentUser() user: User, @Body() dto: GoogleSheetsImportPreviewDto) {
    return this.customTablesImportService.previewGoogleSheets(user.id, dto);
  }

  @Post('import/google-sheets/commit')
  async commitGoogleSheets(@CurrentUser() user: User, @Body() dto: GoogleSheetsImportCommitDto) {
    const job = await this.importJobsService.createGoogleSheetsJob(user.id, dto as any);
    return { jobId: job.id };
  }

  @Get('import/jobs/:jobId')
  async getImportJob(
    @CurrentUser() user: User,
    @Param('jobId', new ParseUUIDPipe()) jobId: string,
  ) {
    const job = await this.importJobsService.getJobForUser(user.id, jobId);
    return {
      id: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      stage: job.stage,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
    };
  }

  @Post('from-data-entry')
  async createFromDataEntry(
    @CurrentUser() user: User,
    @Body() dto: CreateCustomTableFromDataEntryDto,
  ) {
    const table = await this.customTablesService.createFromDataEntry(user.id, dto);
    await this.customTablesCache.bumpList(user.id);
    return table;
  }

  @Post('from-data-entry-custom-tab')
  async createFromDataEntryCustomTab(
    @CurrentUser() user: User,
    @Body() dto: CreateCustomTableFromDataEntryCustomTabDto,
  ) {
    const table = await this.customTablesService.createFromDataEntryCustomTab(user.id, dto);
    await this.customTablesCache.bumpList(user.id);
    return table;
  }

  @Post(':id/sync-from-data-entry')
  async syncFromDataEntry(@CurrentUser() user: User, @Param('id', new ParseUUIDPipe()) id: string) {
    const table = await this.customTablesService.syncFromDataEntry(user.id, id);
    await this.customTablesCache.bumpTable(user.id, id);
    await this.customTablesCache.bumpRows(user.id, id);
    return table;
  }

  @Post('from-statements')
  async createFromStatements(
    @CurrentUser() user: User,
    @Body() dto: CreateCustomTableFromStatementsDto,
  ) {
    const table = await this.customTablesService.createFromStatements(user.id, dto);
    await this.customTablesCache.bumpList(user.id);
    return table;
  }

  @Get(':id')
  async getTable(@CurrentUser() user: User, @Param('id', new ParseUUIDPipe()) id: string) {
    const cacheKey = await this.customTablesCache.tableKey(user.id, id);
    return this.customTablesCache.getOrSet(cacheKey, async () => {
      const table = await this.customTablesService.getTable(user.id, id);
      return table;
    });
  }

  @Patch(':id')
  async updateTable(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCustomTableDto,
  ) {
    const table = await this.customTablesService.updateTable(user.id, id, dto);
    await this.customTablesCache.bumpTable(user.id, id);
    await this.customTablesCache.bumpList(user.id);
    return table;
  }

  @Delete(':id')
  async removeTable(@CurrentUser() user: User, @Param('id', new ParseUUIDPipe()) id: string) {
    await this.customTablesService.removeTable(user.id, id);
    await this.customTablesCache.bumpList(user.id);
    return { ok: true };
  }

  @Post(':id/columns')
  async addColumn(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Body() dto: CreateCustomTableColumnDto,
  ) {
    const column = await this.customTablesService.addColumn(user.id, tableId, dto);
    await this.customTablesCache.bumpTable(user.id, tableId);
    await this.customTablesCache.bumpRows(user.id, tableId);
    return column;
  }

  @Patch(':id/columns/:columnId')
  async updateColumn(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Param('columnId', new ParseUUIDPipe()) columnId: string,
    @Body() dto: UpdateCustomTableColumnDto,
  ) {
    const column = await this.customTablesService.updateColumn(user.id, tableId, columnId, dto);
    await this.customTablesCache.bumpTable(user.id, tableId);
    await this.customTablesCache.bumpRows(user.id, tableId);
    return column;
  }

  @Delete(':id/columns/:columnId')
  async removeColumn(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Param('columnId', new ParseUUIDPipe()) columnId: string,
  ) {
    await this.customTablesService.removeColumn(user.id, tableId, columnId);
    await this.customTablesCache.bumpTable(user.id, tableId);
    await this.customTablesCache.bumpRows(user.id, tableId);
    return { ok: true };
  }

  @Post(':id/columns/reorder')
  async reorderColumns(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Body() dto: ReorderCustomTableColumnsDto,
  ) {
    await this.customTablesService.reorderColumns(user.id, tableId, dto);
    await this.customTablesCache.bumpTable(user.id, tableId);
    return { ok: true };
  }

  @Get(':id/rows')
  async listRows(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('filters') filtersRaw?: string,
  ) {
    const safeLimit = Math.min(Math.max(limit ?? 50, 1), 500);
    const cursorNumber = cursor ? Number(cursor) : undefined;
    let filters: CustomTableRowFilterDto[] | undefined;
    if (filtersRaw) {
      try {
        const parsed = JSON.parse(filtersRaw);
        if (!Array.isArray(parsed)) {
          throw new BadRequestException('Некорректный формат filters');
        }
        filters = parsed as CustomTableRowFilterDto[];
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException('Некорректный JSON в filters');
      }
    }
    const cacheKey = await this.customTablesCache.rowsKey(user.id, tableId, {
      cursor: Number.isFinite(cursorNumber) ? cursorNumber : undefined,
      limit: safeLimit,
      filters,
    });
    return this.customTablesCache.getOrSet(cacheKey, async () => {
      const { items, total } = await this.customTablesService.listRows(user.id, tableId, {
        cursor: Number.isFinite(cursorNumber) ? cursorNumber : undefined,
        limit: safeLimit,
        filters,
      });
      return { items, meta: { total } };
    });
  }

  @Post(':id/rows/paid-classify')
  async classifyPaidStatus(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Body() dto: ClassifyPaidStatusDto,
  ) {
    return this.customTablesService.classifyPaidStatus(user.id, tableId, dto);
  }

  @Post(':id/rows')
  async createRow(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Body() dto: CreateCustomTableRowDto,
  ) {
    const row = await this.customTablesService.createRow(user.id, tableId, dto);
    await this.customTablesCache.bumpRows(user.id, tableId);
    return row;
  }

  @Patch(':id/rows/:rowId')
  async updateRow(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Param('rowId', new ParseUUIDPipe()) rowId: string,
    @Body() dto: UpdateCustomTableRowDto,
  ) {
    const row = await this.customTablesService.updateRow(user.id, tableId, rowId, dto);
    await this.customTablesCache.bumpRows(user.id, tableId);
    return row;
  }

  @Delete(':id/rows/:rowId')
  async removeRow(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Param('rowId', new ParseUUIDPipe()) rowId: string,
  ) {
    await this.customTablesService.removeRow(user.id, tableId, rowId);
    await this.customTablesCache.bumpRows(user.id, tableId);
    return { ok: true };
  }

  @Post(':id/rows/batch')
  async batchCreateRows(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Body() dto: BatchCreateCustomTableRowsDto,
  ) {
    const result = await this.customTablesService.batchCreateRows(user.id, tableId, dto);
    await this.customTablesCache.bumpRows(user.id, tableId);
    return { ok: true, ...result };
  }

  @Patch(':id/view-settings/columns')
  async updateViewSettingsColumn(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) tableId: string,
    @Body() dto: UpdateCustomTableViewSettingsColumnDto,
  ) {
    const table = await this.customTablesService.updateViewSettingsColumn(user.id, tableId, dto);
    await this.customTablesCache.bumpTable(user.id, tableId);
    return table;
  }
}
