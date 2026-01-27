import { IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  credential: string;

  @IsString()
  @IsOptional()
  invitationToken?: string;
}
