import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { Category } from '../../entities/category.entity';
import { CustomTable } from '../../entities/custom-table.entity';
import { CustomTableColumn } from '../../entities/custom-table-column.entity';
import { CustomTableRow } from '../../entities/custom-table-row.entity';
import { GoogleSheet } from '../../entities/google-sheet.entity';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';
import { CustomTablesController } from './custom-tables.controller';
import { CustomTablesImportService } from './custom-tables-import.service';
import { CustomTablesService } from './custom-tables.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomTable,
      CustomTableColumn,
      CustomTableRow,
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
