import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramController } from './telegram.controller';
import { TelegramWebhookController } from './telegram-webhook.controller';
import { TelegramService } from './telegram.service';
import { TelegramReport } from '../../entities/telegram-report.entity';
import { User } from '../../entities/user.entity';
import { ReportsModule } from '../reports/reports.module';
import { TelegramScheduler } from './telegram.scheduler';
import { StatementsModule } from '../statements/statements.module';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramReport, User]), ReportsModule, StatementsModule],
  controllers: [TelegramController, TelegramWebhookController],
  providers: [TelegramService, TelegramScheduler],
  exports: [TelegramService],
})
export class TelegramModule {}
