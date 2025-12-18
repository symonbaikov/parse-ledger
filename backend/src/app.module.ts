import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { getDatabaseConfig } from './config/database.config';
import {
  User,
  Statement,
  Transaction,
  Category,
  Branch,
  Wallet,
  GoogleSheet,
  GoogleSheetRow,
  TelegramReport,
  ParsingRule,
  AuditLog,
  SharedLink,
  FilePermission,
  DataEntry,
  CustomTable,
  CustomTableColumn,
  CustomTableRow,
} from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StatementsModule } from './modules/statements/statements.module';
import { GoogleSheetsModule } from './modules/google-sheets/google-sheets.module';
import { ParsingModule } from './modules/parsing/parsing.module';
import { ClassificationModule } from './modules/classification/classification.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BranchesModule } from './modules/branches/branches.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { StorageModule } from './modules/storage/storage.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { DataEntryModule } from './modules/data-entry/data-entry.module';
import { CustomTablesModule } from './modules/custom-tables/custom-tables.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute for authenticated users
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Statement,
      Transaction,
      Category,
      Branch,
      Wallet,
      GoogleSheet,
      GoogleSheetRow,
      TelegramReport,
      ParsingRule,
      AuditLog,
      SharedLink,
      FilePermission,
      DataEntry,
      CustomTable,
      CustomTableColumn,
      CustomTableRow,
    ]),
    AuthModule,
    UsersModule,
    StatementsModule,
    GoogleSheetsModule,
    ParsingModule,
    ClassificationModule,
    CategoriesModule,
    BranchesModule,
    WalletsModule,
    TransactionsModule,
    ReportsModule,
    StorageModule,
    TelegramModule,
    DataEntryModule,
    CustomTablesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
