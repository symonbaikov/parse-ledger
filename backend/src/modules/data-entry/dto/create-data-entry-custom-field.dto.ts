import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDataEntryCustomFieldDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  icon?: string;
}

