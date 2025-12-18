import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';
import { Branch } from '../../entities/branch.entity';
import { Wallet } from '../../entities/wallet.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { CustomTable } from '../../entities/custom-table.entity';
import { CustomTableColumn } from '../../entities/custom-table-column.entity';
import { CustomTableRow } from '../../entities/custom-table-row.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Category,
      Branch,
      Wallet,
      AuditLog,
      CustomTable,
      CustomTableColumn,
      CustomTableRow,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}







