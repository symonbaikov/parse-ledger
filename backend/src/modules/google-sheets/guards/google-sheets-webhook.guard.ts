import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleSheetsWebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedToken = request.headers['x-webhook-token'] || request.headers['x-webhook-secret'];
    const expectedToken = this.configService.get<string>('SHEETS_WEBHOOK_TOKEN');

    if (!expectedToken) {
      throw new UnauthorizedException('Sheets webhook token is not configured');
    }

    if (!providedToken || providedToken !== expectedToken) {
      throw new UnauthorizedException('Invalid webhook token');
    }

    return true;
  }
}
