import { IsOptional, IsString } from 'class-validator';

export class OAuthCallbackDto {
  @IsString()
  code: string;

  @IsString()
  sheetId: string;

  @IsString()
  @IsOptional()
  sheetName?: string;

  @IsString()
  @IsOptional()
  worksheetName?: string;
}
