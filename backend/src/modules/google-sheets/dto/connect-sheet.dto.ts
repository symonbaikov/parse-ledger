import { IsOptional, IsString } from 'class-validator';

export class ConnectSheetDto {
  @IsString()
  sheetId: string;

  @IsString()
  sheetName: string;

  @IsString()
  @IsOptional()
  worksheetName?: string;
}
