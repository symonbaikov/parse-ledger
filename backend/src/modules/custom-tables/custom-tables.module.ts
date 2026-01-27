import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLog } from "../../entities/audit-log.entity";
import { Category } from "../../entities/category.entity";
import { CustomTableCellStyle } from "../../entities/custom-table-cell-style.entity";
import { CustomTableColumnStyle } from "../../entities/custom-table-column-style.entity";
import { CustomTableColumn } from "../../entities/custom-table-column.entity";
import { CustomTableImportJob } from "../../entities/custom-table-import-job.entity";
import { CustomTableRow } from "../../entities/custom-table-row.entity";
import { CustomTable } from "../../entities/custom-table.entity";
import { DataEntryCustomField } from "../../entities/data-entry-custom-field.entity";
import { DataEntry } from "../../entities/data-entry.entity";
import { GoogleSheet } from "../../entities/google-sheet.entity";
import { Statement } from "../../entities/statement.entity";
import { Transaction } from "../../entities/transaction.entity";
import { User } from "../../entities/user.entity";
import { WorkspaceMember } from "../../entities/workspace-member.entity";
import { GoogleSheetsModule } from "../google-sheets/google-sheets.module";
import { CustomTableImportJobsProcessor } from "./custom-table-import-jobs.processor";
import { CustomTableImportJobsService } from "./custom-table-import-jobs.service";
import { CustomTablesImportService } from "./custom-tables-import.service";
import { CustomTablesController } from "./custom-tables.controller";
import { CustomTablesCacheService } from "./custom-tables-cache.service";
import { CustomTablesService } from "./custom-tables.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomTable,
      CustomTableImportJob,
      CustomTableColumnStyle,
      CustomTableColumn,
      CustomTableRow,
      CustomTableCellStyle,
      DataEntry,
      DataEntryCustomField,
      AuditLog,
      GoogleSheet,
      Category,
      Statement,
      Transaction,
      User,
      WorkspaceMember,
    ]),
    GoogleSheetsModule,
  ],
  controllers: [CustomTablesController],
  providers: [
    CustomTablesService,
    CustomTablesCacheService,
    CustomTablesImportService,
    CustomTableImportJobsService,
    CustomTableImportJobsProcessor,
  ],
  exports: [CustomTablesService, CustomTableImportJobsService],
})
export class CustomTablesModule {}
