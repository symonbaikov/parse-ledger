import { Cron } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";
import { GoogleDriveService } from "./google-drive.service";

@Injectable()
export class GoogleDriveScheduler {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Cron("*/15 * * * *")
  async handleSync() {
    await this.googleDriveService.syncDueIntegrations();
  }
}
