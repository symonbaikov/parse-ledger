import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @IsString()
  @IsOptional()
  @MaxLength(7)
  color?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  backgroundImage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;
}
