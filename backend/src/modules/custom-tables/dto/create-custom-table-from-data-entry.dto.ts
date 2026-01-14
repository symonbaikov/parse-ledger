import { IsEnum, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { DataEntryType } from '../../../entities/data-entry.entity';

export enum DataEntryToCustomTableScope {
  TYPE = 'type',
  ALL = 'all',
}

export class CreateCustomTableFromDataEntryDto {
  @IsEnum(DataEntryToCustomTableScope)
  scope: DataEntryToCustomTableScope;

  @ValidateIf(
    o => (o as CreateCustomTableFromDataEntryDto).scope === DataEntryToCustomTableScope.TYPE,
  )
  @IsEnum(DataEntryType)
  type?: DataEntryType;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;
}
