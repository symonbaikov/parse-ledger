import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateWalletDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  initialBalance?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
