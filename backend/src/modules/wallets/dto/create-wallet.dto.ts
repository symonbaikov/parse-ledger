import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  name: string;

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
}
