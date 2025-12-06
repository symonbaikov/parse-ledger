import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTransactionDto } from './update-transaction.dto';

export class BulkUpdateItemDto {
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => UpdateTransactionDto)
  updates: UpdateTransactionDto;
}

export class BulkUpdateTransactionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateItemDto)
  items: BulkUpdateItemDto[];
}

