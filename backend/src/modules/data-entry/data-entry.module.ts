import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataEntry } from '../../entities/data-entry.entity';
import { DataEntryService } from './data-entry.service';
import { DataEntryController } from './data-entry.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DataEntry])],
  controllers: [DataEntryController],
  providers: [DataEntryService],
  exports: [DataEntryService],
})
export class DataEntryModule {}
