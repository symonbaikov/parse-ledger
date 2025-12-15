import {
  ArrayNotEmpty,
  IsArray,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const normalizeCellValue = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  return String(value).trim();
};

export class GoogleSheetValuesDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => normalizeCellValue(value))
  colB?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => normalizeCellValue(value))
  colC?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => normalizeCellValue(value))
  colF?: string | null;
}

export class GoogleSheetEditedCellDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  col: number;

  @IsString()
  a1: string;
}

export class GoogleSheetsUpdateDto {
  @IsString()
  spreadsheetId: string;

  @IsString()
  sheetName: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  row: number;

  @ValidateNested()
  @Type(() => GoogleSheetValuesDto)
  values: GoogleSheetValuesDto;

  @IsOptional()
  @IsISO8601()
  editedAt?: string;

  @IsOptional()
  @IsString()
  editor?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GoogleSheetEditedCellDto)
  editedCell?: GoogleSheetEditedCellDto;

  @IsOptional()
  @IsString()
  eventId?: string;
}

export class GoogleSheetsBatchUpdateDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => GoogleSheetsUpdateDto)
  items: GoogleSheetsUpdateDto[];
}
