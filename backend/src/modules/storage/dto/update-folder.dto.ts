import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateFolderDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name?: string;

  @IsOptional()
  @IsUUID()
  tagId?: string | null;
}
