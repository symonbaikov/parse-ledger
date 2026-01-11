import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { WorkspaceRole } from '../../../entities';

class WorkspaceMemberPermissionsDto {
  @IsOptional()
  @IsBoolean()
  canEditStatements?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditCustomTables?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditCategories?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditDataEntry?: boolean;

  @IsOptional()
  @IsBoolean()
  canShareFiles?: boolean;
}

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkspaceMemberPermissionsDto)
  permissions?: WorkspaceMemberPermissionsDto;
}
