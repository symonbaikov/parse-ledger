import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImportConfigService } from './config/import.config';

/**
 * Import module providing configuration and services for import session workflow
 */
@Module({
  imports: [ConfigModule],
  providers: [ImportConfigService],
  exports: [ImportConfigService],
})
export class ImportModule {}
