import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class ExportSheetsDto {
  @ApiProperty({ description: 'Array of receipt IDs to export', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  receiptIds: string[];

  @ApiProperty({ required: false, description: 'Existing spreadsheet ID to append to' })
  @IsOptional()
  @IsString()
  spreadsheetId?: string;
}
