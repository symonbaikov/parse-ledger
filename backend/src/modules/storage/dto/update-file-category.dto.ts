import { IsOptional, IsUUID } from 'class-validator';

export class UpdateFileCategoryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;
}
