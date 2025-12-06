import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../../entities/user.entity';
import { TelegramReport, ReportStatus, ReportType } from '../../entities/telegram-report.entity';
import { ReportsService } from '../reports/reports.service';
import { StatementsService } from '../statements/statements.service';
import { ConnectTelegramDto } from './dto/connect-telegram.dto';
import { SendTelegramReportDto } from './dto/send-report.dto';
import { DailyReport } from '../reports/interfaces/daily-report.interface';
import { MonthlyReport } from '../reports/interfaces/monthly-report.interface';

interface TelegramSendResult {
  messageId: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken?: string;
  private readonly apiBase?: string;
  private readonly fileApiBase?: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TelegramReport)
    private readonly telegramReportRepository: Repository<TelegramReport>,
    private readonly reportsService: ReportsService,
    private readonly statementsService: StatementsService,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.apiBase = this.botToken ? `https://api.telegram.org/bot${this.botToken}` : undefined;
    this.fileApiBase = this.botToken ? `https://api.telegram.org/file/bot${this.botToken}` : undefined;

    if (!this.botToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not configured. Telegram features will be disabled.');
    }
  }

  isEnabled(): boolean {
    return Boolean(this.botToken);
  }

  async connectAccount(user: User, dto: ConnectTelegramDto): Promise<User> {
    if (!dto.chatId) {
      throw new BadRequestException('chatId is required to connect Telegram');
    }

    const telegramId = dto.telegramId || dto.chatId;

    const updatedUser = this.userRepository.merge(user, {
      telegramId,
      telegramChatId: dto.chatId,
    });

    const savedUser = await this.userRepository.save(updatedUser);

    if (this.botToken) {
      try {
        await this.sendMessage(dto.chatId, '✅ Telegram подключен. Мы будем отправлять отчёты в этот чат.');
      } catch (error: any) {
        this.logger.warn(`Failed to send confirmation message: ${error?.message || error}`);
      }
    }

    return savedUser;
  }

  async sendReport(user: User, dto: SendTelegramReportDto) {
    const chatId = dto.chatId || user.telegramChatId;
    if (!chatId) {
      throw new BadRequestException('Telegram chat is not connected. Укажите chatId или подключите Telegram.');
    }

    if (!this.botToken) {
      throw new BadRequestException('Telegram bot is not configured on the server');
    }

    switch (dto.reportType) {
      case ReportType.DAILY: {
        const date = dto.date || this.formatDateOnly(new Date());
        return this.handleDailyReport(user, chatId, date);
      }
      case ReportType.MONTHLY: {
        const now = new Date();
        const year = dto.year || now.getUTCFullYear();
        const month = dto.month || now.getUTCMonth() + 1;
        return this.handleMonthlyReport(user, chatId, year, month);
      }
      default:
        throw new BadRequestException('Unsupported report type for Telegram');
    }
  }

  async listReports(user: User, page: number = 1, limit: number = 20) {
    const [data, total] = await this.telegramReportRepository.findAndCount({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  private async handleDailyReport(user: User, chatId: string, date: string) {
    const reportDate = this.toDateOnly(date);
    const existing = await this.findExisting(user.id, ReportType.DAILY, reportDate);

    if (existing?.status === ReportStatus.SENT) {
      return { status: 'already_sent', report: existing };
    }

    const dailyReport = await this.reportsService.generateDailyReport(user.id, date);
    const message = this.formatDailyReportMessage(date, dailyReport);

    return this.persistAndSend(user.id, chatId, ReportType.DAILY, reportDate, message, existing);
  }

  private async handleMonthlyReport(user: User, chatId: string, year: number, month: number) {
    const reportDate = this.toDateOnly(`${year}-${String(month).padStart(2, '0')}-01`);
    const existing = await this.findExisting(user.id, ReportType.MONTHLY, reportDate);

    if (existing?.status === ReportStatus.SENT) {
      return { status: 'already_sent', report: existing };
    }

    const monthlyReport = await this.reportsService.generateMonthlyReport(user.id, year, month);
    const message = this.formatMonthlyReportMessage(year, month, monthlyReport);

    return this.persistAndSend(
      user.id,
      chatId,
      ReportType.MONTHLY,
      reportDate,
      message,
      existing,
    );
  }

  private async persistAndSend(
    userId: string,
    chatId: string,
    reportType: ReportType,
    reportDate: Date,
    message: string,
    existing?: TelegramReport | null,
  ) {
    const record = existing ||
      this.telegramReportRepository.create({
        userId,
        chatId,
        reportType,
        reportDate,
      });

    record.chatId = chatId;
    record.reportDate = reportDate;
    record.reportType = reportType;
    record.status = ReportStatus.PENDING;

    const savedRecord = await this.telegramReportRepository.save(record);

    try {
      const result = await this.sendMessage(chatId, message);
      savedRecord.status = ReportStatus.SENT;
      savedRecord.sentAt = new Date();
      savedRecord.messageId = result.messageId;
      await this.telegramReportRepository.save(savedRecord);

      return { status: 'sent', report: savedRecord };
    } catch (error) {
      savedRecord.status = ReportStatus.FAILED;
      await this.telegramReportRepository.save(savedRecord);
      throw error;
    }
  }

  private async findExisting(
    userId: string,
    reportType: ReportType,
    reportDate: Date,
  ): Promise<TelegramReport | null> {
    const reportDateStr = this.formatDateOnly(reportDate);
    return this.telegramReportRepository
      .createQueryBuilder('report')
      .where('report.userId = :userId', { userId })
      .andWhere('report.reportType = :reportType', { reportType })
      .andWhere('report.reportDate = :reportDate', { reportDate: reportDateStr })
      .getOne();
  }

  private async sendMessage(chatId: string, text: string): Promise<TelegramSendResult> {
    if (!this.apiBase) {
      throw new BadRequestException('Telegram bot is not configured');
    }

    const response = await fetch(`${this.apiBase}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const payload = await response.json();

    if (!payload.ok) {
      const description = payload?.description || 'Unknown error';
      this.logger.error(`Failed to send Telegram message: ${description}`);
      throw new BadRequestException(`Telegram API error: ${description}`);
    }

    return { messageId: String(payload.result?.message_id || '') };
  }

  async handleUpdate(update: any): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const message = update?.message;
    if (!message) {
      return;
    }

    const chatId = message.chat?.id ? String(message.chat.id) : null;
    const text: string | undefined = message.text?.trim();
    const telegramId = message.from?.id ? String(message.from.id) : null;

    if (!chatId) {
      return;
    }

    if (text?.startsWith('/start')) {
      await this.sendMessage(
        chatId,
        `👋 Привет! Твой Telegram ID: ${telegramId || 'не определён'}. Добавь его в настройках профиля, чтобы получать отчёты.`,
      );
      return;
    }

    if (text?.startsWith('/help')) {
      await this.sendHelpMessage(chatId);
      return;
    }

    if (text?.startsWith('/report')) {
      await this.handleReportCommand(chatId, telegramId, text);
      return;
    }

    if (message.document) {
      await this.handleDocumentUpload(chatId, telegramId, message.document);
      return;
    }

    if (text?.startsWith('/')) {
      await this.sendMessage(chatId, 'Неизвестная команда. Используйте /help для списка команд.');
    }
  }

  private async handleReportCommand(chatId: string, telegramId: string | null, text: string): Promise<void> {
    if (!telegramId) {
      await this.sendMessage(chatId, 'Не удалось определить ваш Telegram ID. Попробуйте позже.');
      return;
    }

    const user = await this.findUserByTelegram(telegramId, chatId);

    if (!user) {
      await this.sendMessage(
        chatId,
        `Пользователь с Telegram ID ${telegramId} не подключён. Укажите этот ID в настройках аккаунта.`,
      );
      return;
    }

    const args = text.split(' ').filter(Boolean);
    const arg = args[1];

    try {
      if (arg === 'monthly') {
        const now = new Date();
        await this.sendReport(user, {
          reportType: ReportType.MONTHLY,
          chatId,
          year: now.getUTCFullYear(),
          month: now.getUTCMonth() + 1,
        });
      } else if (arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) {
        await this.sendReport(user, {
          reportType: ReportType.DAILY,
          chatId,
          date: arg,
        });
      } else {
        await this.sendReport(user, {
          reportType: ReportType.DAILY,
          chatId,
          date: this.formatDateOnly(new Date()),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling /report command: ${message}`);
      await this.sendMessage(chatId, 'Не удалось отправить отчёт. Попробуйте позже.');
    }
  }

  private async handleDocumentUpload(chatId: string, telegramId: string | null, document: any): Promise<void> {
    if (!telegramId) {
      await this.sendMessage(chatId, '⚠️ Не удалось определить ваш Telegram ID. Отправьте /start и повторите.');
      return;
    }

    const user = await this.findUserByTelegram(telegramId, chatId);
    if (!user) {
      await this.sendMessage(
        chatId,
        `Пользователь с Telegram ID ${telegramId} не подключён. Укажите ID и chatId в настройках или вызовите /start, чтобы увидеть свой ID.`,
      );
      return;
    }

    const fileName = this.sanitizeFileName(document.file_name || `statement-${document.file_id}.pdf`);
    const mimeType: string = document.mime_type || 'application/pdf';

    if (mimeType !== 'application/pdf' && !fileName.toLowerCase().endsWith('.pdf')) {
      await this.sendMessage(chatId, 'Поддерживаются только PDF-файлы выписок.');
      return;
    }

    await this.sendMessage(chatId, '📥 Файл получен, начинаем обработку...');

    try {
      const multerFile = await this.downloadTelegramFile(document.file_id, fileName, mimeType);
      const statement = await this.statementsService.create(user, multerFile as Express.Multer.File);
      await this.sendMessage(
        chatId,
        `✅ Файл принят и отправлен в обработку. Статус: ${statement.status}. Проверить результат можно в веб-интерфейсе FinFlow.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to handle Telegram document: ${message}`);
      await this.sendMessage(chatId, 'Не удалось обработать файл. Попробуйте позже или загрузите через веб-интерфейс.');
    }
  }

  private async findUserByTelegram(telegramId: string | null, chatId: string): Promise<User | null> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true });

    if (telegramId) {
      query.andWhere('(user.telegramId = :telegramId OR user.telegramChatId = :chatId)', {
        telegramId,
        chatId,
      });
    } else {
      query.andWhere('user.telegramChatId = :chatId', { chatId });
    }

    const user = await query.getOne();

    // Auto-bind chatId if user has telegramId but no chatId saved
    if (user && !user.telegramChatId) {
      user.telegramChatId = chatId;
      await this.userRepository.save(user);
    }

    return user || null;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  }

  private async downloadTelegramFile(
    fileId: string,
    fileName: string,
    mimeType: string,
  ): Promise<Express.Multer.File> {
    if (!this.apiBase || !this.fileApiBase) {
      throw new BadRequestException('Telegram bot is not configured');
    }

    const filePath = await this.getTelegramFilePath(fileId);
    const downloadUrl = `${this.fileApiBase}/${filePath}`;

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new BadRequestException('Не удалось скачать файл из Telegram');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), 'uploads', 'telegram');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${fileName}`;
    const targetPath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(targetPath, buffer);

    const file: Partial<Express.Multer.File> = {
      fieldname: 'file',
      originalname: fileName,
      encoding: '7bit',
      mimetype: mimeType,
      size: buffer.length,
      destination: uploadsDir,
      filename: uniqueName,
      path: targetPath,
      buffer,
    };

    return file as Express.Multer.File;
  }

  private async getTelegramFilePath(fileId: string): Promise<string> {
    if (!this.apiBase) {
      throw new BadRequestException('Telegram bot is not configured');
    }

    const response = await fetch(`${this.apiBase}/getFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId }),
    });

    const payload = await response.json();

    if (!payload.ok) {
      const description = payload?.description || 'Unknown error';
      this.logger.error(`Failed to get Telegram file info: ${description}`);
      throw new BadRequestException(`Telegram API error: ${description}`);
    }

    return payload.result?.file_path as string;
  }

  private async sendHelpMessage(chatId: string): Promise<void> {
    const help = [
      'Доступные команды:',
      '/start — показать ваш Telegram ID и приветствие',
      '/help — эта подсказка',
      '/report — ежедневный отчёт за сегодня',
      '/report YYYY-MM-DD — отчёт за указанную дату',
      '/report monthly — отчёт за текущий месяц',
    ].join('\n');

    await this.sendMessage(chatId, help);
  }

  private formatDailyReportMessage(date: string, report: DailyReport): string {
    const lines: string[] = [];
    lines.push(`📅 Ежедневный отчёт — ${date}`);
    lines.push(`➕ Приход: ${this.formatAmount(report.income.totalAmount)} (${report.income.transactionCount})`);
    lines.push(`➖ Расход: ${this.formatAmount(report.expense.totalAmount)} (${report.expense.transactionCount})`);
    lines.push(`📊 Итог дня: ${this.formatAmount(report.summary.difference)}`);

    if (report.income.topCounterparties.length > 0) {
      lines.push('\nТоп контрагентов по приходу:');
      report.income.topCounterparties.slice(0, 5).forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.name} — ${this.formatAmount(item.amount)} (${item.count})`);
      });
    }

    if (report.expense.topCategories.length > 0) {
      lines.push('\nТоп категорий по расходу:');
      report.expense.topCategories.slice(0, 5).forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.categoryName} — ${this.formatAmount(item.amount)} (${item.count})`);
      });
    }

    return lines.join('\n');
  }

  private formatMonthlyReportMessage(year: number, month: number, report: MonthlyReport): string {
    const lines: string[] = [];
    lines.push(`🗓️ Отчёт за ${String(month).padStart(2, '0')}.${year}`);
    lines.push(`➕ Приход: ${this.formatAmount(report.summary.totalIncome)}`);
    lines.push(`➖ Расход: ${this.formatAmount(report.summary.totalExpense)}`);
    lines.push(`📊 Разница: ${this.formatAmount(report.summary.difference)} (операций: ${report.summary.transactionCount})`);

    if (report.categoryDistribution.length > 0) {
      lines.push('\nТоп категорий расходов:');
      report.categoryDistribution.slice(0, 5).forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.categoryName} — ${this.formatAmount(item.amount)} (${item.percentage.toFixed(1)}%)`);
      });
    }

    if (report.counterpartyDistribution.length > 0) {
      lines.push('\nТоп контрагентов:');
      report.counterpartyDistribution.slice(0, 5).forEach((item, idx) => {
        lines.push(`${idx + 1}. ${item.counterpartyName} — ${this.formatAmount(item.amount)} (${item.percentage.toFixed(1)}%)`);
      });
    }

    return lines.join('\n');
  }

  private formatAmount(value: number | null | undefined): string {
    const amount = value || 0;
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  private toDateOnly(dateLike: string | Date): Date {
    const d = typeof dateLike === 'string' ? new Date(dateLike) : dateLike;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  private formatDateOnly(dateLike: string | Date): string {
    const d = typeof dateLike === 'string' ? new Date(dateLike) : dateLike;
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
