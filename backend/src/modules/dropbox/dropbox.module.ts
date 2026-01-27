import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageService } from '../../common/services/file-storage.service';
import {
  DropboxSettings,
  Integration,
  IntegrationToken,
  Statement,
  User,
  WorkspaceMember,
} from '../../entities';
import { StatementsModule } from '../statements/statements.module';
import { DropboxController } from './dropbox.controller';
import { DropboxScheduler } from './dropbox.scheduler';
import { DropboxService } from './dropbox.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Integration,
      IntegrationToken,
      DropboxSettings,
      Statement,
      User,
      WorkspaceMember,
    ]),
    StatementsModule,
  ],
  controllers: [DropboxController],
  providers: [DropboxService, DropboxScheduler, FileStorageService],
})
export class DropboxModule {}
