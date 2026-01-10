import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatementFileData1735200000002 implements MigrationInterface {
  name = 'AddStatementFileData1735200000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "statements"
      ADD COLUMN IF NOT EXISTS "file_data" bytea
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "statements"
      DROP COLUMN IF EXISTS "file_data"
    `);
  }
}

