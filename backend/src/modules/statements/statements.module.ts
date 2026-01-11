import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementsController } from './statements.controller';
import { StatementsService } from './statements.service';
import { Statement } from '../../entities/statement.entity';
import { Transaction } from '../../entities/transaction.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { User, WorkspaceMember } from '../../entities';
import { ParsingModule } from '../parsing/parsing.module';
import { FileStorageService } from '../../common/services/file-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Statement, Transaction, AuditLog, User, WorkspaceMember]),
    ParsingModule,
  ],
  controllers: [StatementsController],
  providers: [StatementsService, FileStorageService],
  exports: [StatementsService],
})
export class StatementsModule {}
