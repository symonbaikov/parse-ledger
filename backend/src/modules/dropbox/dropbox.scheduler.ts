import { Cron } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";
import { DropboxService } from "./dropbox.service";

@Injectable()
export class DropboxScheduler {
  constructor(private readonly dropboxService: DropboxService) {}

  @Cron("*/15 * * * *")
  async handleSync() {
    await this.dropboxService.syncDueIntegrations();
  }
}
