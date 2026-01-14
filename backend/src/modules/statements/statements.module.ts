import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageService } from '../../common/services/file-storage.service';
import { User, WorkspaceMember } from '../../entities';
import { AuditLog } from '../../entities/audit-log.entity';
import { Statement } from '../../entities/statement.entity';
import { Transaction } from '../../entities/transaction.entity';
import { ParsingModule } from '../parsing/parsing.module';
import { StatementsController } from './statements.controller';
import { StatementsService } from './statements.service';

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
