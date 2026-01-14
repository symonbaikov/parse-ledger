import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { MetricsService } from './metrics.service';

const getRouteLabel = (req: Request): string => {
  const baseUrl = (req as any).baseUrl || '';
  const routePath = (req as any).route?.path || '';
  if (routePath) return `${baseUrl}${routePath}`;
  return (req.originalUrl || req.url || '').split('?')[0] || 'unknown';
};

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const method = (req.method || 'UNKNOWN').toUpperCase();
    const route = getRouteLabel(req);
    const endTimer = this.metricsService.httpRequestDurationSeconds.startTimer({
      method,
      route,
      status_code: '0',
    });

    res.once('finish', () => {
      const statusCode = String(res.statusCode || 0);
      this.metricsService.httpRequestsTotal.inc({ method, route, status_code: statusCode });
      endTimer({ status_code: statusCode });
    });

    return next.handle();
  }
}
