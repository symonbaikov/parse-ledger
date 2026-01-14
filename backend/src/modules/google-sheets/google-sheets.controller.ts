import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { ConnectSheetDto } from './dto/connect-sheet.dto';
import type { OAuthCallbackDto } from './dto/oauth-callback.dto';
import type { GoogleSheetsService } from './google-sheets.service';

@Controller('google-sheets')
@UseGuards(JwtAuthGuard)
export class GoogleSheetsController {
  constructor(private readonly googleSheetsService: GoogleSheetsService) {}

  private toPublicSheet(sheet: any) {
    const refreshToken = typeof sheet.refreshToken === 'string' ? sheet.refreshToken : '';
    return {
      id: sheet.id,
      sheetId: sheet.sheetId,
      sheetName: sheet.sheetName,
      worksheetName: sheet.worksheetName,
      isActive: sheet.isActive,
      oauthConnected: Boolean(refreshToken && !refreshToken.includes('placeholder')),
      lastSync: sheet.lastSync,
      createdAt: sheet.createdAt,
      updatedAt: sheet.updatedAt,
    };
  }

  @Get('oauth/url')
  async getAuthUrl(@Query('state') state?: string) {
    return { url: this.googleSheetsService.getAuthUrl(state) };
  }

  @Post('oauth/callback')
  async oauthCallback(@Body() body: OAuthCallbackDto, @CurrentUser() user: User) {
    const sheet = await this.googleSheetsService.connectWithOAuthCode(
      user,
      body.code,
      body.sheetId,
      body.worksheetName,
      body.sheetName,
    );
    return { message: 'Google Sheet connected', sheet: this.toPublicSheet(sheet) };
  }

  @Post('connect')
  async connect(@Body() connectDto: ConnectSheetDto, @CurrentUser() user: User) {
    throw new BadRequestException(
      'Подключение через этот endpoint больше не поддерживается. Используйте OAuth: GET /google-sheets/oauth/url → POST /google-sheets/oauth/callback',
    );
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    const sheets = await this.googleSheetsService.findAll(user.id);
    return sheets.map(sheet => this.toPublicSheet(sheet));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const sheet = await this.googleSheetsService.findOne(id, user.id);
    return this.toPublicSheet(sheet);
  }

  @Put(':id/sync')
  async sync(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body?: { statementId?: string },
  ) {
    const result = await this.googleSheetsService.syncTransactions(id, user.id, body?.statementId);
    return {
      message: `Successfully synced ${result.synced} transactions`,
      lastSync: result.sheet.lastSync,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.googleSheetsService.remove(id, user.id);
    return { message: 'Google Sheet disconnected successfully' };
  }
}
