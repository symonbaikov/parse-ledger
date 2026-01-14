import { AppDataSource } from '../src/data-source';

async function runMigrations() {
  try {
    console.log('Initializing data source...');
    await AppDataSource.initialize();

    console.log('Running migrations...');
    await AppDataSource.runMigrations();

    console.log('Migrations completed successfully!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

runMigrations();
