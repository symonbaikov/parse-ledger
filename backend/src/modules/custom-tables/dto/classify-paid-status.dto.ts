import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from "class-validator";

export class ClassifyPaidStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsString({ each: true })
  rowIds: string[];
}
