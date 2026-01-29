import { IsArray, IsNotEmpty } from 'class-validator';
import type { ClassificationCondition } from '../interfaces/classification-rule.interface';

export class TestCategorizationRuleDto {
  @IsArray()
  @IsNotEmpty()
  conditions: ClassificationCondition[];

  @IsArray()
  @IsNotEmpty()
  transactionIds: string[];
}
