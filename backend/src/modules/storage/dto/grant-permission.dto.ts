import { IsBoolean, IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FilePermissionType } from '../../../entities';

/**
 * DTO for granting file permission to a user
 */
export class GrantPermissionDto {
  @IsUUID()
  userId: string;

  @IsEnum(FilePermissionType)
  permissionType: FilePermissionType;

  @IsOptional()
  @IsBoolean()
  canReshare?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
