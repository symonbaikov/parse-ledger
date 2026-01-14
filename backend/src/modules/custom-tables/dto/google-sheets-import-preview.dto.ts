import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export enum GoogleSheetsImportLayoutType {
  AUTO = 'auto',
  FLAT = 'flat',
  MATRIX = 'matrix',
}

export class GoogleSheetsImportPreviewDto {
  @IsUUID('4')
  googleSheetId: string;

  @IsOptional()
  @IsString()
  worksheetName?: string;

  @IsOptional()
  @IsString()
  range?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  headerRowIndex?: number;

  @IsOptional()
  @IsEnum(GoogleSheetsImportLayoutType)
  layoutType?: GoogleSheetsImportLayoutType;
}
