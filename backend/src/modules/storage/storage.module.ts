import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import {
  SharedLink,
  FilePermission,
  Statement,
  Transaction,
  Category,
  User,
  WorkspaceMember,
} from '../../entities';
import { FileStorageService } from '../../common/services/file-storage.service';

/**
 * Storage module for file management, sharing, and permissions
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SharedLink,
      FilePermission,
      Statement,
      Transaction,
      Category,
      User,
      WorkspaceMember,
    ]),
  ],
  controllers: [StorageController],
  providers: [StorageService, FileStorageService],
  exports: [StorageService],
})
export class StorageModule {}

