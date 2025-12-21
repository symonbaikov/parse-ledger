import { IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class CreateCustomTableRowDto {
  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsObject()
  styles?: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(1)
  rowNumber?: number;
}
