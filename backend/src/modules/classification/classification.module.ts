import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from '../../entities/branch.entity';
import { Category } from '../../entities/category.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Wallet } from '../../entities/wallet.entity';
import { ClassificationController } from './classification.controller';
import { ClassificationService } from './services/classification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Branch, Wallet, Transaction])],
  controllers: [ClassificationController],
  providers: [ClassificationService],
  exports: [ClassificationService],
})
export class ClassificationModule {}
