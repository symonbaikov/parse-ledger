import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type {
  ClassificationCondition,
  ClassificationResult,
} from '../interfaces/classification-rule.interface';

export class CreateCategorizationRuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsNotEmpty()
  conditions: ClassificationCondition[];

  @IsNotEmpty()
  result: ClassificationResult;

  @IsInt()
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
