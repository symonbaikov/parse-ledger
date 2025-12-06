import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GoogleSheetsController } from './google-sheets.controller';
import { GoogleSheetsService } from './google-sheets.service';
import { GoogleSheetsApiService } from './services/google-sheets-api.service';
import { GoogleSheet } from '../../entities/google-sheet.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';
import { Branch } from '../../entities/branch.entity';
import { Wallet } from '../../entities/wallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoogleSheet, Transaction, Category, Branch, Wallet]),
    ConfigModule,
  ],
  controllers: [GoogleSheetsController],
  providers: [GoogleSheetsService, GoogleSheetsApiService],
  exports: [GoogleSheetsService, GoogleSheetsApiService],
})
export class GoogleSheetsModule {}

