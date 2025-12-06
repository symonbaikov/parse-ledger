import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementsController } from './statements.controller';
import { StatementsService } from './statements.service';
import { Statement } from '../../entities/statement.entity';
import { Transaction } from '../../entities/transaction.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { ParsingModule } from '../parsing/parsing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Statement, Transaction, AuditLog]),
    ParsingModule,
  ],
  controllers: [StatementsController],
  providers: [StatementsService],
  exports: [StatementsService],
})
export class StatementsModule {}

