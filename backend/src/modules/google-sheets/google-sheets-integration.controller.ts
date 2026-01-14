import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  type MessageEvent,
  ParseIntPipe,
  Post,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { GoogleSheetsBatchUpdateDto, GoogleSheetsUpdateDto } from './dto/sheets-update.dto';
import { GoogleSheetsWebhookGuard } from './guards/google-sheets-webhook.guard';
import type {
  GoogleSheetsAnalyticsService,
  GoogleSheetsSummaryResponse,
} from './services/google-sheets-analytics.service';
import type { GoogleSheetsRealtimeService } from './services/google-sheets-realtime.service';
import type { GoogleSheetsUpdatesService } from './services/google-sheets-updates.service';

@Controller('integrations/google-sheets')
export class GoogleSheetsIntegrationController {
  constructor(
    private readonly updatesService: GoogleSheetsUpdatesService,
    private readonly realtimeService: GoogleSheetsRealtimeService,
    private readonly analyticsService: GoogleSheetsAnalyticsService,
  ) {}

  @Public()
  @UseGuards(GoogleSheetsWebhookGuard)
  @Post('update')
  async receiveUpdate(@Body() body: GoogleSheetsUpdateDto) {
    const result = await this.updatesService.handleWebhookUpdate(body);
    return {
      ok: result.processed,
      reason: result.reason,
      rowId: result.row?.id,
    };
  }

  @Public()
  @UseGuards(GoogleSheetsWebhookGuard)
  @Post('batch')
  async receiveBatch(@Body() body: GoogleSheetsBatchUpdateDto) {
    const results = await this.updatesService.handleBatchUpdate(body);
    return { ok: true, processed: results.filter(item => item.processed).length, results };
  }

  @Get('rows')
  async listRows(
    @CurrentUser() user: User,
    @Query('spreadsheetId') spreadsheetId?: string,
    @Query('googleSheetId') googleSheetId?: string,
    @Query('sheetName') sheetName?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    const safeLimit = Math.min(Math.max(limit ?? 50, 1), 500);
    const rows = await this.updatesService.listRows({
      userId: user.id,
      spreadsheetId: spreadsheetId || undefined,
      googleSheetId: googleSheetId || undefined,
      sheetName: sheetName || undefined,
      limit: safeLimit,
    });

    return { items: rows };
  }

  @Sse('stream')
  stream(@CurrentUser() user: User): Observable<MessageEvent> {
    return this.realtimeService.subscribe(user.id);
  }

  @Get('summary')
  async getSummary(
    @CurrentUser() user: User,
    @Query('spreadsheetId') spreadsheetId?: string,
    @Query('sheetName') sheetName?: string,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days?: number,
  ): Promise<GoogleSheetsSummaryResponse> {
    const summary = await this.analyticsService.getSummary({
      userId: user.id,
      spreadsheetId: spreadsheetId || undefined,
      sheetName: sheetName || undefined,
      days,
    });

    return summary;
  }
}
