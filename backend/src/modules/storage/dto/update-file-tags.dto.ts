import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateFileTagsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];
}
