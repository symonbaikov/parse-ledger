import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { User } from '../../entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ImportDropboxFilesDto } from './dto/import-dropbox-files.dto';
import { UpdateDropboxSettingsDto } from './dto/update-dropbox-settings.dto';
import { DropboxService } from './dropbox.service';

@Controller('integrations/dropbox')
@UseGuards(JwtAuthGuard)
export class DropboxController {
  constructor(private readonly dropboxService: DropboxService) {}

  @Get('status')
  async status(@CurrentUser() user: User) {
    return this.dropboxService.getStatus(user.id);
  }

  @Get('connect')
  async connect(@CurrentUser() user: User) {
    const url = this.dropboxService.getAuthUrl(user);
    return { url };
  }

  @Public()
  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    const redirect = await this.dropboxService.handleOAuthCallback({
      code,
      state,
      error,
    });
    return res.redirect(redirect);
  }

  @Post('disconnect')
  async disconnect(@CurrentUser() user: User) {
    return this.dropboxService.disconnect(user.id);
  }

  @Post('settings')
  async updateSettings(@CurrentUser() user: User, @Body() dto: UpdateDropboxSettingsDto) {
    return this.dropboxService.updateSettings(user.id, dto);
  }

  @Get('picker-token')
  async getPickerToken(@CurrentUser() user: User) {
    return this.dropboxService.getPickerToken(user.id);
  }

  @Post('import')
  async importFiles(@CurrentUser() user: User, @Body() dto: ImportDropboxFilesDto) {
    return this.dropboxService.importFiles(user.id, dto);
  }

  @Post('sync')
  async sync(@CurrentUser() user: User) {
    return this.dropboxService.syncNow(user.id);
  }
}
