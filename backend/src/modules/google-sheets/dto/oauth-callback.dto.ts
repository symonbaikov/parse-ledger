import { IsString, IsOptional } from 'class-validator';

export class OAuthCallbackDto {
  @IsString()
  code: string;

  @IsString()
  sheetId: string;

  @IsString()
  @IsOptional()
  worksheetName?: string;
}

