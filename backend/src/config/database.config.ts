import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const isProd = nodeEnv === 'production';
  const runMigrationsEnv = (configService.get<string>('RUN_MIGRATIONS') || '').toLowerCase();
  const shouldRunMigrations =
    runMigrationsEnv === 'true' || (!isProd && runMigrationsEnv !== 'false');
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
