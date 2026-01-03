import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { WorkspaceRole } from '../../../entities';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;
}
