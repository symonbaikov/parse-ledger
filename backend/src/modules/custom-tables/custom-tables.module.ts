import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { Category } from '../../entities/category.entity';
import { CustomTable } from '../../entities/custom-table.entity';
import { CustomTableCellStyle } from '../../entities/custom-table-cell-style.entity';
import { CustomTableColumn } from '../../entities/custom-table-column.entity';
import { CustomTableColumnStyle } from '../../entities/custom-table-column-style.entity';
import { CustomTableRow } from '../../entities/custom-table-row.entity';
import { DataEntry } from '../../entities/data-entry.entity';
import { DataEntryCustomField } from '../../entities/data-entry-custom-field.entity';
import { GoogleSheet } from '../../entities/google-sheet.entity';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';
import { CustomTablesController } from './custom-tables.controller';
import { CustomTablesImportService } from './custom-tables-import.service';
import { CustomTablesService } from './custom-tables.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomTable,
      CustomTableColumnStyle,
      CustomTableColumn,
      CustomTableRow,
      CustomTableCellStyle,
      DataEntry,
      DataEntryCustomField,
      AuditLog,
      GoogleSheet,
      Category,
    ]),
    GoogleSheetsModule,
  ],
  controllers: [CustomTablesController],
  providers: [CustomTablesService, CustomTablesImportService],
  exports: [CustomTablesService],
})
export class CustomTablesModule {}
