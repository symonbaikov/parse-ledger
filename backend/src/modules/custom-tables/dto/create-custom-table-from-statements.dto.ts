import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCustomTableFromStatementsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  statementIds: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
