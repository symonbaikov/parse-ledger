import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ImportDriveFilesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  fileIds: string[];
}
