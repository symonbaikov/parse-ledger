import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ImportDropboxFilesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  fileIds: string[];
}
