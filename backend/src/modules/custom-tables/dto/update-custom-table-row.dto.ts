import { IsObject, IsOptional } from 'class-validator';

export class UpdateCustomTableRowDto {
  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsObject()
  styles?: Record<string, any>;
}
