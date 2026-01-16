import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { Branch } from '../../entities/branch.entity';
import { Category } from '../../entities/category.entity';
import { CustomTableColumn } from '../../entities/custom-table-column.entity';
import { CustomTableRow } from '../../entities/custom-table-row.entity';
import { CustomTable } from '../../entities/custom-table.entity';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { Wallet } from '../../entities/wallet.entity';
import { AuditLogController } from './audit-log.controller';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

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
      User,
    ]),
  ],
  controllers: [ReportsController, AuditLogController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
