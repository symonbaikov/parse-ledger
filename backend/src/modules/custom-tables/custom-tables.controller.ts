import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
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

@Controller('custom-tables')
@UseGuards(JwtAuthGuard)
export class CustomTablesController {
  constructor(
    private readonly customTablesService: CustomTablesService,
    private readonly customTablesImportService: CustomTablesImportService,
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
    return this.customTablesImportService.commitGoogleSheets(user.id, dto);
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
  ) {
    const safeLimit = Math.min(Math.max(limit ?? 50, 1), 500);
    const cursorNumber = cursor ? Number(cursor) : undefined;
    const items = await this.customTablesService.listRows(user.id, tableId, {
      cursor: Number.isFinite(cursorNumber) ? cursorNumber : undefined,
      limit: safeLimit,
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
}
