import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDataEntryCustomFieldDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  icon?: string | null;
}

