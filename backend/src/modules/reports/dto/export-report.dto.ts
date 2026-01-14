import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum ExportFormat {
  EXCEL = 'excel',
  CSV = 'csv',
}

export class ExportReportDto {
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsEnum(ExportFormat)
  format: ExportFormat = ExportFormat.EXCEL;
}
