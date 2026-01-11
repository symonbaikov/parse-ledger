import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { AppLogger } from './common/observability/app-logger.service';
import { requestContextMiddleware } from './common/observability/request-context.middleware';

async function bootstrap() {
  const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  // Ensure reports directory exists
  const reportsDir = path.join(uploadsDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger(),
  });

  // Serve static files from public folder (frontend assets)
  const publicPath = path.join(__dirname, 'public');
  if (fs.existsSync(publicPath)) {
    (app as any).useStaticAssets(publicPath);
  }
  (app as any).useStaticAssets(uploadsDir, { prefix: '/uploads' });

  // Request context & correlation IDs
  (app as any).use(requestContextMiddleware);

  // Global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    exposedHeaders: ['x-request-id', 'x-trace-id'],
  });

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('FinFlow API')
    .setDescription('REST API для загрузки выписок, классификации, отчётов и интеграций')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Вставьте access_token из /auth/login или /auth/refresh',
      },
      'bearer',
    )
    .addServer(process.env.API_BASE_URL || 'http://localhost:3001/api/v1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log({ type: 'startup', url: `http://localhost:${port}` });
  logger.log({ type: 'startup', api: `http://localhost:${port}/api/v1` });
  logger.log({ type: 'startup', swagger: `http://localhost:${port}/api/docs` });
}

bootstrap();
