import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConnectGmailDto {
  @ApiProperty({ description: 'Workspace ID', required: false })
  @IsString()
  @IsOptional()
  workspaceId?: string;
}
