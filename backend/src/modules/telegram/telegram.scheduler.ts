import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, type Repository } from 'typeorm';
import { ReportType } from '../../entities/telegram-report.entity';
import { User } from '../../entities/user.entity';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramScheduler {
  private readonly logger = new Logger(TelegramScheduler.name);

  constructor(
    private readonly telegramService: TelegramService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailyReports(): Promise<void> {
    if (!this.telegramService.isEnabled()) {
      return;
    }

    const today = new Date();
    const date = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;

    const users = await this.loadUsersWithTelegram();

    for (const user of users) {
      try {
        await this.telegramService.sendReport(user, {
          reportType: ReportType.DAILY,
          chatId: user.telegramChatId || undefined,
          date,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to send daily report for user ${user.id}: ${message}`);
      }
    }
  }

  @Cron('0 9 1 * *')
  async sendMonthlyReports(): Promise<void> {
    if (!this.telegramService.isEnabled()) {
      return;
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    const users = await this.loadUsersWithTelegram();

    for (const user of users) {
      try {
        await this.telegramService.sendReport(user, {
          reportType: ReportType.MONTHLY,
          chatId: user.telegramChatId || undefined,
          year,
          month,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to send monthly report for user ${user.id}: ${message}`);
      }
    }
  }

  private async loadUsersWithTelegram(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        telegramChatId: Not(IsNull()),
        isActive: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
