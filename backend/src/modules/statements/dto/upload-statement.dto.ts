import { IsUUID, IsOptional } from 'class-validator';

export class UploadStatementDto {
  @IsUUID()
  @IsOptional()
  googleSheetId?: string;

  @IsUUID()
  @IsOptional()
  walletId?: string;

  @IsUUID()
  @IsOptional()
  branchId?: string;
}


