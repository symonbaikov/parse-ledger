import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class BulkApproveDto {
  @ApiProperty({ description: 'Array of receipt IDs to approve', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  receiptIds: string[];

  @ApiProperty({ required: false, description: 'Category ID to assign to all receipts' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
