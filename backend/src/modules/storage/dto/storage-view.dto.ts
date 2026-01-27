import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class StorageViewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @IsOptional()
  filters?: Record<string, any>;
}
