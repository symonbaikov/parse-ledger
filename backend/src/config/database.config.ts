import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const isProd = nodeEnv === 'production';
  const runMigrationsEnv = (configService.get<string>('RUN_MIGRATIONS') || '').toLowerCase();
  // Default to running migrations everywhere unless explicitly disabled.
  // This prevents production deployments from silently missing new tables/enums.
  const shouldRunMigrations = runMigrationsEnv !== 'false';
  const migrationsGlob = __filename.endsWith('.ts')
    ? 'src/migrations/*.ts'
    : 'dist/migrations/*.js';

  return {
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'),
    autoLoadEntities: true,
    synchronize: false,
    logging: !isProd,
    migrations: [migrationsGlob],
    migrationsRun: shouldRunMigrations,
  };
};
