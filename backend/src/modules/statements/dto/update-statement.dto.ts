import { IsOptional, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStatementDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  balanceStart?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  balanceEnd?: number | null;

  @IsOptional()
  @IsDateString()
  statementDateFrom?: string | null;

  @IsOptional()
  @IsDateString()
  statementDateTo?: string | null;
}
