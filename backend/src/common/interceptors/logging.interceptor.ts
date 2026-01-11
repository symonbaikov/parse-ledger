import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { RequestContext } from '../observability/request-context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        const baseUrl = (request as any).baseUrl || '';
        const routePath = (request as any).route?.path || '';
        const route = routePath ? `${baseUrl}${routePath}` : undefined;

        this.logger.log({
          type: 'http_request',
          method,
          url,
          route,
          statusCode: response.statusCode,
          responseTimeMs: delay,
          requestId: RequestContext.getRequestId(),
          traceId: RequestContext.getTraceId(),
        });
      }),
    );
  }
}







