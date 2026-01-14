import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateCustomTableViewSettingsColumnDto {
  @IsString()
  columnKey: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(1200)
  width?: number;
}
