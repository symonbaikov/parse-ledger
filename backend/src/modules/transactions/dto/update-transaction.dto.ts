import { IsDateString, IsString, IsOptional, IsUUID, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { TransactionType } from '../../../entities/transaction.entity';

export class UpdateTransactionDto {
  @IsDateString()
  @IsOptional()
  transactionDate?: Date;

  @IsString()
  @IsOptional()
  documentNumber?: string;

  @IsString()
  @IsOptional()
  counterpartyName?: string;

  @IsString()
  @IsOptional()
  counterpartyBin?: string;

  @IsString()
  @IsOptional()
  counterpartyAccount?: string;

  @IsString()
  @IsOptional()
  counterpartyBank?: string;

  @IsNumber()
  @IsOptional()
  debit?: number;

  @IsNumber()
  @IsOptional()
  credit?: number;

  @IsNumber()
  @IsOptional()
  amountForeign?: number;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  paymentPurpose?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;

  @IsUUID()
  @IsOptional()
  walletId?: string;

  @IsString()
  @IsOptional()
  article?: string;

  @IsString()
  @IsOptional()
  activityType?: string;

  @IsEnum(TransactionType)
  @IsOptional()
  transactionType?: TransactionType;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}






