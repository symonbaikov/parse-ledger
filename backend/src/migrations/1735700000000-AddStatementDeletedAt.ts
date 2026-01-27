import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatementDeletedAt1735700000000 implements MigrationInterface {
  name = 'AddStatementDeletedAt1735700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "statements"
      ADD COLUMN IF NOT EXISTS "deleted_at" timestamp
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "statements"
      DROP COLUMN IF EXISTS "deleted_at"
    `);
  }
}
