import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  BadRequestException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { CustomTablesService } from './custom-tables.service';
import { CreateCustomTableDto } from './dto/create-custom-table.dto';
import { UpdateCustomTableDto } from './dto/update-custom-table.dto';
import { CreateCustomTableColumnDto } from './dto/create-custom-table-column.dto';
import { UpdateCustomTableColumnDto } from './dto/update-custom-table-column.dto';
import { ReorderCustomTableColumnsDto } from './dto/reorder-custom-table-columns.dto';
import { CreateCustomTableRowDto } from './dto/create-custom-table-row.dto';
import { UpdateCustomTableRowDto } from './dto/update-custom-table-row.dto';
import { BatchCreateCustomTableRowsDto } from './dto/batch-create-custom-table-rows.dto';
import { CustomTablesImportService } from './custom-tables-import.service';
import { GoogleSheetsImportPreviewDto } from './dto/google-sheets-import-preview.dto';
import { GoogleSheetsImportCommitDto } from './dto/google-sheets-import-commit.dto';
import { CustomTableImportJobsService } from './custom-table-import-jobs.service';
import { CreateCustomTableFromDataEntryDto } from './dto/create-custom-table-from-data-entry.dto';
import { CreateCustomTableFromDataEntryCustomTabDto } from './dto/create-custom-table-from-data-entry-custom-tab.dto';
import { CreateCustomTableFromStatementsDto } from './dto/create-custom-table-from-statements.dto';
import { CustomTableRowFilterDto } from './dto/list-custom-table-rows.dto';
import { UpdateCustomTableViewSettingsColumnDto } from './dto/update-custom-table-view-settings.dto';

@Controller('custom-tables')
@UseGuards(JwtAuthGuard)
export class CustomTablesController {
  constructor(
    private readonly customTablesService: CustomTablesService,
    private readonly customTablesImportService: CustomTablesImportService,
    private readonly importJobsService: CustomTableImportJobsService,
  ) {}

  @Post()
  async createTable(@CurrentUser() user: User, @Body() dto: CreateCustomTableDto) {
    const table = await this.customTablesService.createTable(user.id, dto);
    return table;
  }

  @Get()
  async listTables(@CurrentUser() user: User) {
    const items = await this.customTablesService.listTables(user.id);
    return { items };
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
  async getImportJob(@CurrentUser() user: User, @Param('jobId') jobId: string) {
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
  async createFromDataEntry(@CurrentUser() user: User, @Body() dto: CreateCustomTableFromDataEntryDto) {
    return this.customTablesService.createFromDataEntry(user.id, dto);
  }

  @Post('from-data-entry-custom-tab')
  async createFromDataEntryCustomTab(
    @CurrentUser() user: User,
    @Body() dto: CreateCustomTableFromDataEntryCustomTabDto,
  ) {
    return this.customTablesService.createFromDataEntryCustomTab(user.id, dto);
  }

  @Post(':id/sync-from-data-entry')
  async syncFromDataEntry(@CurrentUser() user: User, @Param('id') id: string) {
    return this.customTablesService.syncFromDataEntry(user.id, id);
  }

  @Post('from-statements')
  async createFromStatements(@CurrentUser() user: User, @Body() dto: CreateCustomTableFromStatementsDto) {
    return this.customTablesService.createFromStatements(user.id, dto);
  }

  @Get(':id')
  async getTable(@CurrentUser() user: User, @Param('id') id: string) {
    const table = await this.customTablesService.getTable(user.id, id);
    return table;
  }

  @Patch(':id')
  async updateTable(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateCustomTableDto) {
    const table = await this.customTablesService.updateTable(user.id, id, dto);
    return table;
  }

  @Delete(':id')
  async removeTable(@CurrentUser() user: User, @Param('id') id: string) {
    await this.customTablesService.removeTable(user.id, id);
    return { ok: true };
  }

  @Post(':id/columns')
  async addColumn(
    @CurrentUser() user: User,
    @Param('id') tableId: string,
    @Body() dto: CreateCustomTableColumnDto,
  ) {
    const column = await this.customTablesService.addColumn(user.id, tableId, dto);
    return column;
  }

  @Patch(':id/columns/:columnId')
  async updateColumn(
    @CurrentUser() user: User,
    @Param('id') tableId: string,
    @Param('columnId') columnId: string,
    @Body() dto: UpdateCustomTableColumnDto,
  ) {
    const column = await this.customTablesService.updateColumn(user.id, tableId, columnId, dto);
    return column;
  }

  @Delete(':id/columns/:columnId')
  async removeColumn(
    @CurrentUser() user: User,
    @Param('id') tableId: string,
    @Param('columnId') columnId: string,
  ) {
    await this.customTablesService.removeColumn(user.id, tableId, columnId);
    return { ok: true };
  }

  @Post(':id/columns/reorder')
  async reorderColumns(
    @CurrentUser() user: User,
    @Param('id') tableId: string,
    @Body() dto: ReorderCustomTableColumnsDto,
  ) {
    await this.customTablesService.reorderColumns(user.id, tableId, dto);
    return { ok: true };
  }

  @Get(':id/rows')
  async listRows(
    @CurrentUser() user: User,
    @Param('id') tableId: string,
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
    const items = await this.customTablesService.listRows(user.id, tableId, {
      cursor: Number.isFinite(cursorNumber) ? cursorNumber : undefined,
      limit: safeLimit,
      filters,
    });
    return { items };
  }

  @Post(':id/rows')
  async createRow(
    @CurrentUser() user: User,
    @Param('id') tableId: string,
    @Body() dto: CreateCustomTableRowDto,
  ) {
    const row = await this.customTablesService.createRow(user.id, tableId, dto);
    return row;
  }

  @Patch(':id/rows/:rowId')
  async updateRow(
    @CurrentUser() user: User,
    @Param('id') tableId: string,
    @Param('rowId') rowId: string,
    @Body() dto: UpdateCustomTableRowDto,
  ) {
    const row = await this.customTablesService.updateRow(user.id, tableId, rowId, dto);
    return row;
  }

  @Delete(':id/rows/:rowId')
  async removeRow(
    @CurrentUser() user: User,
    @Param('id') tableId: string,
    @Param('rowId') rowId: string,
  ) {
    await this.customTablesService.removeRow(user.id, tableId, rowId);
    return { ok: true };
  }

  @Post(':id/rows/batch')
  async batchCreateRows(
    @CurrentUser() user: User,
    @Param('id') tableId: string,
    @Body() dto: BatchCreateCustomTableRowsDto,
  ) {
    const result = await this.customTablesService.batchCreateRows(user.id, tableId, dto);
    return { ok: true, ...result };
  }

  @Patch(':id/view-settings/columns')
  async updateViewSettingsColumn(
    @CurrentUser() user: User,
    @Param('id') tableId: string,
    @Body() dto: UpdateCustomTableViewSettingsColumnDto,
  ) {
    const table = await this.customTablesService.updateViewSettingsColumn(user.id, tableId, dto);
    return table;
  }
}
