import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MarkDuplicateDto {
  @ApiProperty({ description: 'ID of the original receipt' })
  @IsUUID()
  originalReceiptId: string;
}
