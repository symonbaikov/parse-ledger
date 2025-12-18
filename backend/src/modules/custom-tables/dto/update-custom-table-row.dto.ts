import { IsObject } from 'class-validator';

export class UpdateCustomTableRowDto {
  @IsObject()
  data: Record<string, any>;
}

