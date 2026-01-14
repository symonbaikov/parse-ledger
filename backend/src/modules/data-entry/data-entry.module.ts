import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, WorkspaceMember } from '../../entities';
import { DataEntryCustomField } from '../../entities/data-entry-custom-field.entity';
import { DataEntry } from '../../entities/data-entry.entity';
import { DataEntryController } from './data-entry.controller';
import { DataEntryService } from './data-entry.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataEntry, DataEntryCustomField, User, WorkspaceMember])],
  controllers: [DataEntryController],
  providers: [DataEntryService],
  exports: [DataEntryService],
})
export class DataEntryModule {}
