import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for accessing a shared link (with optional password)
 */
export class AccessSharedLinkDto {
  @IsOptional()
  @IsString()
  password?: string;
}
