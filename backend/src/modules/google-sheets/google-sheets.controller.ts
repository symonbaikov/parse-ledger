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
import { WorkspaceId } from '../../common/decorators/workspace.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceContextGuard } from '../../common/guards/workspace-context.guard';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectSheetDto } from './dto/connect-sheet.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { GoogleSheetsService } from './google-sheets.service';

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
  @UseGuards(JwtAuthGuard, WorkspaceContextGuard)
  async oauthCallback(
    @Body() body: OAuthCallbackDto,
    @CurrentUser() user: User,
    @WorkspaceId() workspaceId: string,
  ) {
    const sheet = await this.googleSheetsService.connectWithOAuthCode(
      user,
      workspaceId,
      body.code,
      body.sheetId,
      body.worksheetName,
      body.sheetName,
    );
    return { message: 'Google Sheet connected', sheet: this.toPublicSheet(sheet) };
  }

  @Post('connect')
  @UseGuards(JwtAuthGuard, WorkspaceContextGuard)
  async connect(
    @Body() connectDto: ConnectSheetDto,
    @CurrentUser() user: User,
    @WorkspaceId() workspaceId: string,
  ) {
    throw new BadRequestException(
      'Подключение через этот endpoint больше не поддерживается. Используйте OAuth: GET /google-sheets/oauth/url → POST /google-sheets/oauth/callback',
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceContextGuard)
  async findAll(@CurrentUser() user: User, @WorkspaceId() workspaceId: string) {
    const sheets = await this.googleSheetsService.findAll(workspaceId);
    return sheets.map(sheet => this.toPublicSheet(sheet));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceContextGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @WorkspaceId() workspaceId: string,
  ) {
    const sheet = await this.googleSheetsService.findOne(id, workspaceId);
    return this.toPublicSheet(sheet);
  }

  @Put(':id/sync')
  @UseGuards(JwtAuthGuard, WorkspaceContextGuard)
  async sync(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @WorkspaceId() workspaceId: string,
    @Body() body?: { statementId?: string },
  ) {
    const result = await this.googleSheetsService.syncTransactions(
      id,
      workspaceId,
      body?.statementId,
    );
    return {
      message: `Successfully synced ${result.synced} transactions`,
      lastSync: result.sheet.lastSync,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceContextGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @WorkspaceId() workspaceId: string,
  ) {
    await this.googleSheetsService.remove(id, workspaceId);
    return { message: 'Google Sheet disconnected successfully' };
  }
}
