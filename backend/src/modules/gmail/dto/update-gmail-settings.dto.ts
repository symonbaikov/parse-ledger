import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateGmailSettingsDto {
  @ApiProperty({ description: 'Label name for receipts', required: false })
  @IsString()
  @IsOptional()
  labelName?: string;

  @ApiProperty({ description: 'Enable automatic filtering', required: false })
  @IsBoolean()
  @IsOptional()
  filterEnabled?: boolean;

  @ApiProperty({ description: 'Filter by subjects containing keywords', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subjects?: string[];

  @ApiProperty({ description: 'Filter by sender email addresses', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  senders?: string[];

  @ApiProperty({ description: 'Only include emails with attachments', required: false })
  @IsBoolean()
  @IsOptional()
  hasAttachment?: boolean;

  @ApiProperty({ description: 'Keywords to filter by', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}
