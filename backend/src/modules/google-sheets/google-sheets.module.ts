import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GoogleSheetsController } from './google-sheets.controller';
import { GoogleSheetsIntegrationController } from './google-sheets-integration.controller';
import { GoogleSheetsService } from './google-sheets.service';
import { GoogleSheetsApiService } from './services/google-sheets-api.service';
import { GoogleSheet } from '../../entities/google-sheet.entity';
import { GoogleSheetRow } from '../../entities/google-sheet-row.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';
import { Branch } from '../../entities/branch.entity';
import { Wallet } from '../../entities/wallet.entity';
import { GoogleSheetsUpdatesService } from './services/google-sheets-updates.service';
import { GoogleSheetsRealtimeService } from './services/google-sheets-realtime.service';
import { GoogleSheetsWebhookGuard } from './guards/google-sheets-webhook.guard';
import { GoogleSheetsAnalyticsService } from './services/google-sheets-analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoogleSheet, GoogleSheetRow, Transaction, Category, Branch, Wallet]),
    ConfigModule,
  ],
  controllers: [GoogleSheetsController, GoogleSheetsIntegrationController],
  providers: [
    GoogleSheetsService,
    GoogleSheetsApiService,
    GoogleSheetsUpdatesService,
    GoogleSheetsRealtimeService,
    GoogleSheetsAnalyticsService,
    GoogleSheetsWebhookGuard,
  ],
  exports: [GoogleSheetsService, GoogleSheetsApiService, GoogleSheetsUpdatesService],
})
export class GoogleSheetsModule {}
