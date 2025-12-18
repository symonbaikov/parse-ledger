import { ArrayMinSize, IsArray, IsInt, IsObject, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BatchRowItemDto {
  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(1)
  rowNumber?: number;
}

export class BatchCreateCustomTableRowsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BatchRowItemDto)
  rows: BatchRowItemDto[];
}

