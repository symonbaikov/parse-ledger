import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GoogleSheetsService } from './google-sheets.service';
import { ConnectSheetDto } from './dto/connect-sheet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';

@Controller('google-sheets')
@UseGuards(JwtAuthGuard)
export class GoogleSheetsController {
  constructor(private readonly googleSheetsService: GoogleSheetsService) {}

  @Get('oauth/url')
  async getAuthUrl(@Query('state') state?: string) {
    return { url: this.googleSheetsService.getAuthUrl(state) };
  }

  @Post('oauth/callback')
  async oauthCallback(
    @Body() body: OAuthCallbackDto,
    @CurrentUser() user: User,
  ) {
    const sheet = await this.googleSheetsService.connectWithOAuthCode(
      user,
      body.code,
      body.sheetId,
      body.worksheetName,
    );
    return { message: 'Google Sheet connected', sheet };
  }

  @Post('connect')
  async connect(
    @Body() connectDto: ConnectSheetDto,
    @CurrentUser() user: User,
  ) {
    // TODO: Implement OAuth flow to get tokens
    // For now, this is a placeholder
    // In production, you would:
    // 1. Redirect user to Google OAuth
    // 2. Get authorization code
    // 3. Exchange code for tokens
    // 4. Store tokens encrypted

    const accessToken = 'placeholder_access_token';
    const refreshToken = 'placeholder_refresh_token';

    return this.googleSheetsService.create(user, connectDto, accessToken, refreshToken);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.googleSheetsService.findAll(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.googleSheetsService.findOne(id, user.id);
  }

  @Put(':id/sync')
  async sync(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body?: { statementId?: string },
  ) {
    const result = await this.googleSheetsService.syncTransactions(
      id,
      user.id,
      body?.statementId,
    );
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
