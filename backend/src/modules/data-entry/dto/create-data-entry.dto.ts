import { IsEnum, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { DataEntryType } from '../../../entities/data-entry.entity';

export class CreateDataEntryDto {
  @IsEnum(DataEntryType)
  type: DataEntryType;

  @IsDateString()
  date: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  note?: string | null;
}
