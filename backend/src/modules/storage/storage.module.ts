import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageService } from '../../common/services/file-storage.service';
import {
  Category,
  FilePermission,
  SharedLink,
  Statement,
  Transaction,
  User,
  WorkspaceMember,
} from '../../entities';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

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
