import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConnectTelegramDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsOptional()
  telegramId?: string;
}
