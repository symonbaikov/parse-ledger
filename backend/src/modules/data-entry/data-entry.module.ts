import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataEntry } from '../../entities/data-entry.entity';
import { DataEntryCustomField } from '../../entities/data-entry-custom-field.entity';
import { User, WorkspaceMember } from '../../entities';
import { DataEntryService } from './data-entry.service';
import { DataEntryController } from './data-entry.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DataEntry, DataEntryCustomField, User, WorkspaceMember])],
  controllers: [DataEntryController],
  providers: [DataEntryService],
  exports: [DataEntryService],
})
export class DataEntryModule {}
