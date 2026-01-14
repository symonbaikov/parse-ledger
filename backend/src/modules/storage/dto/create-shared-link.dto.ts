import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SharePermissionLevel } from '../../../entities';

/**
 * DTO for creating a shared link
 */
export class CreateSharedLinkDto {
  @IsEnum(SharePermissionLevel)
  permission: SharePermissionLevel;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  allowAnonymous?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
