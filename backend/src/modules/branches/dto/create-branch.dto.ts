import { IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
