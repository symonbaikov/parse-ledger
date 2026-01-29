import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import type {
  ClassificationCondition,
  ClassificationResult,
} from '../interfaces/classification-rule.interface';

export class UpdateCategorizationRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  conditions?: ClassificationCondition[];

  @IsOptional()
  result?: ClassificationResult;

  @IsInt()
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
