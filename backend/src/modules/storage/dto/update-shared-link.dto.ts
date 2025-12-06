import { IsEnum, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';
import { SharePermissionLevel, ShareLinkStatus } from '../../../entities';

/**
 * DTO for updating a shared link
 */
export class UpdateSharedLinkDto {
  @IsOptional()
  @IsEnum(SharePermissionLevel)
  permission?: SharePermissionLevel;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @IsOptional()
  @IsString()
  password?: string | null;

  @IsOptional()
  @IsEnum(ShareLinkStatus)
  status?: ShareLinkStatus;

  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;

  @IsOptional()
  @IsString()
  description?: string | null;
}




