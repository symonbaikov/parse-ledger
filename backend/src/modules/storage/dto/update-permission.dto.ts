import { IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { FilePermissionType } from '../../../entities';

/**
 * DTO for updating file permission
 */
export class UpdatePermissionDto {
  @IsOptional()
  @IsEnum(FilePermissionType)
  permissionType?: FilePermissionType;

  @IsOptional()
  @IsBoolean()
  canReshare?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}




