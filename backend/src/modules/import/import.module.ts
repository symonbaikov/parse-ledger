import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportSession } from '../../entities/import-session.entity';
import { ImportConfigService } from './config/import.config';
import { ImportRetryService } from './services/import-retry.service';

/**
 * Import module providing configuration and services for import session workflow
 */
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ImportSession])],
  providers: [ImportConfigService, ImportRetryService],
  exports: [ImportConfigService, ImportRetryService],
})
export class ImportModule {}
