import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { Permission } from '../../common/enums/permissions.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectTelegramDto } from './dto/connect-telegram.dto';
import { SendTelegramReportDto } from './dto/send-report.dto';
import { TelegramService } from './telegram.service';

@Controller('telegram')
@UseGuards(JwtAuthGuard)
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('connect')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.TELEGRAM_CONNECT)
  async connect(@CurrentUser() user: User, @Body() dto: ConnectTelegramDto) {
    const updated = await this.telegramService.connectAccount(user, dto);
    return {
      userId: updated.id,
      telegramId: updated.telegramId,
      telegramChatId: updated.telegramChatId,
    };
  }

  @Get('reports')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.TELEGRAM_VIEW)
  async listReports(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentPage = page ? Number.parseInt(page, 10) : 1;
    const pageSize = limit ? Number.parseInt(limit, 10) : 20;
    return this.telegramService.listReports(user, currentPage, pageSize);
  }

  @Post('send-report')
  @UseGuards(PermissionsGuard)
  @RequirePermission(Permission.TELEGRAM_SEND)
  async sendReport(@CurrentUser() user: User, @Body() dto: SendTelegramReportDto) {
    return this.telegramService.sendReport(user, dto);
  }
}
