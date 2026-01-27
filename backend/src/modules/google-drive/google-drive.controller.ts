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
import { ImportDriveFilesDto } from './dto/import-drive-files.dto';
import { UpdateDriveSettingsDto } from './dto/update-drive-settings.dto';
import { GoogleDriveService } from './google-drive.service';

@Controller('integrations/google-drive')
@UseGuards(JwtAuthGuard)
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Get('status')
  async status(@CurrentUser() user: User) {
    return this.googleDriveService.getStatus(user.id);
  }

  @Get('connect')
  async connect(@CurrentUser() user: User) {
    const url = this.googleDriveService.getAuthUrl(user);
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
    const redirect = await this.googleDriveService.handleOAuthCallback({
      code,
      state,
      error,
    });
    return res.redirect(redirect);
  }

  @Post('disconnect')
  async disconnect(@CurrentUser() user: User) {
    return this.googleDriveService.disconnect(user.id);
  }

  @Post('settings')
  async updateSettings(@CurrentUser() user: User, @Body() dto: UpdateDriveSettingsDto) {
    return this.googleDriveService.updateSettings(user.id, dto);
  }

  @Get('picker-token')
  async getPickerToken(@CurrentUser() user: User) {
    return this.googleDriveService.getPickerToken(user.id);
  }

  @Post('import')
  async importFiles(@CurrentUser() user: User, @Body() dto: ImportDriveFilesDto) {
    return this.googleDriveService.importFiles(user.id, dto);
  }

  @Post('sync')
  async sync(@CurrentUser() user: User) {
    return this.googleDriveService.syncNow(user.id);
  }
}
