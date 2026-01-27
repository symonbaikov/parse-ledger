import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class BulkFileActionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  statementIds: string[];
}
