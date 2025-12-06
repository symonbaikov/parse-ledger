import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('telegram/webhook')
export class TelegramWebhookController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post()
  @Public()
  @HttpCode(200)
  async handleUpdate(@Body() update: any) {
    await this.telegramService.handleUpdate(update);
    return { ok: true };
  }
}
