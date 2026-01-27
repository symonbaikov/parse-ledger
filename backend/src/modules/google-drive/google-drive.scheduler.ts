import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GoogleDriveService } from './google-drive.service';

@Injectable()
export class GoogleDriveScheduler {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Cron('*/15 * * * *')
  async handleSync() {
    await this.googleDriveService.syncDueIntegrations();
  }
}
