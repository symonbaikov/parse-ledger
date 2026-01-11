import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../../entities/transaction.entity';
import { Statement } from '../../entities/statement.entity';
import { User, WorkspaceMember } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Statement, User, WorkspaceMember])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}







