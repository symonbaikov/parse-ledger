import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataEntryHiddenBaseTabs1735400000000 implements MigrationInterface {
  name = 'AddDataEntryHiddenBaseTabs1735400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "data_entry_hidden_base_tabs" jsonb NOT NULL DEFAULT '[]'::jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "data_entry_hidden_base_tabs"`,
    );
  }
}
