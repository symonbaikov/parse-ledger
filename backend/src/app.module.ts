import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { getDatabaseConfig } from './config/database.config';
import {
  AuditLog,
  Branch,
  Category,
  CustomTable,
  CustomTableColumn,
  CustomTableRow,
  DataEntry,
  FilePermission,
  GoogleSheet,
  GoogleSheetRow,
  ParsingRule,
  SharedLink,
  Statement,
  TelegramReport,
  Transaction,
  User,
  Wallet,
  Workspace,
  WorkspaceInvitation,
  WorkspaceMember,
} from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { BranchesModule } from './modules/branches/branches.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ClassificationModule } from './modules/classification/classification.module';
import { CustomTablesModule } from './modules/custom-tables/custom-tables.module';
import { DataEntryModule } from './modules/data-entry/data-entry.module';
import { GoogleSheetsModule } from './modules/google-sheets/google-sheets.module';
import { HttpMetricsInterceptor } from './modules/observability/http-metrics.interceptor';
import { ObservabilityModule } from './modules/observability/observability.module';
import { ParsingModule } from './modules/parsing/parsing.module';
import { ReportsModule } from './modules/reports/reports.module';
import { StatementsModule } from './modules/statements/statements.module';
import { StorageModule } from './modules/storage/storage.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';

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
      Workspace,
      WorkspaceInvitation,
      WorkspaceMember,
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
    WorkspacesModule,
    ObservabilityModule,
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
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
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
