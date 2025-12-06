import { AppDataSource } from '../src/data-source';

async function syncSchema() {
  try {
    console.log('Initializing data source...');
    await AppDataSource.initialize();

    console.log('Synchronizing schema from entities...');
    await AppDataSource.synchronize();

    console.log('Schema sync completed successfully.');
  } catch (error) {
    console.error('Error during schema sync:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

syncSchema();
