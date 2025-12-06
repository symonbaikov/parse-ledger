import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ReportType } from '../../../entities/telegram-report.entity';

export class SendTelegramReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsString()
  @IsOptional()
  date?: string; // For daily reports (YYYY-MM-DD)

  @IsInt()
  @Min(2000)
  @Max(2100)
  @IsOptional()
  year?: number; // For monthly reports

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  month?: number; // For monthly reports

  @IsString()
  @IsOptional()
  chatId?: string;
}
