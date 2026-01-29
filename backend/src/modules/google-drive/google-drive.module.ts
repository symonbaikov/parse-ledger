import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageService } from '../../common/services/file-storage.service';
import {
  DriveSettings,
  Integration,
  IntegrationToken,
  Statement,
  User,
  WorkspaceMember,
} from '../../entities';
import { AuditModule } from '../audit/audit.module';
import { StatementsModule } from '../statements/statements.module';
import { GoogleDriveController } from './google-drive.controller';
import { GoogleDriveScheduler } from './google-drive.scheduler';
import { GoogleDriveService } from './google-drive.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Integration,
      IntegrationToken,
      DriveSettings,
      Statement,
      User,
      WorkspaceMember,
    ]),
    StatementsModule,
    AuditModule,
  ],
  controllers: [GoogleDriveController],
  providers: [GoogleDriveService, GoogleDriveScheduler, FileStorageService],
})
export class GoogleDriveModule {}
