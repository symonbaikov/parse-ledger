import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';
import { Permission } from '../../../common/enums/permissions.enum';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Permission[];
}


