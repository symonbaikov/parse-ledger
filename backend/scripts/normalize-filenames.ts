import * as path from 'path';
import { DataSource } from 'typeorm';
import { Statement } from '../src/entities/statement.entity';

/**
 * Script to normalize existing filenames that may have encoding issues
 */
async function normalizeFilenames() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'parse_ledger',
    entities: [Statement],
    synchronize: false,
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Connected!');

    const statementRepo = dataSource.getRepository(Statement);
    const statements = await statementRepo.find();

    console.log(`Found ${statements.length} statements to check`);

    let updated = 0;
    for (const statement of statements) {
      const originalFileName = statement.fileName;

      // Check if filename contains encoding issues (mojibake)
      // Look for common patterns like Ð, Ñ, Ð which indicate UTF-8 bytes interpreted as Latin-1
      if (/[ÐÑÐ¿Ðº]/g.test(originalFileName)) {
        try {
          // Try to fix by converting back to bytes and decoding as UTF-8
          const buffer = Buffer.from(originalFileName, 'latin1');
          const correctedName = buffer.toString('utf8');

          if (correctedName !== originalFileName) {
            console.log(`\nFixing: "${originalFileName}"`);
            console.log(`     -> "${correctedName}"`);

            statement.fileName = correctedName;
            await statementRepo.save(statement);
            updated++;
          }
        } catch (error) {
          console.error(`Failed to fix filename for statement ${statement.id}:`, error);
        }
      }
    }

    console.log(`\n✅ Updated ${updated} filenames`);
    console.log(`ℹ️  ${statements.length - updated} filenames were already correct`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

normalizeFilenames();
