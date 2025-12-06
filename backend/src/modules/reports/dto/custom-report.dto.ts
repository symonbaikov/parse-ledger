import { IsEnum, IsOptional, IsDateString, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportGroupBy {
  CATEGORY = 'category',
  COUNTERPARTY = 'counterparty',
  BRANCH = 'branch',
  WALLET = 'wallet',
  DAY = 'day',
  MONTH = 'month',
}

export enum ReportFormat {
  JSON = 'json',
  EXCEL = 'excel',
  CSV = 'csv',
}

export class CustomReportDto {
  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;

  @IsEnum(ReportGroupBy)
  @IsOptional()
  groupBy?: ReportGroupBy;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  walletId?: string;

  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat = ReportFormat.JSON;
}








