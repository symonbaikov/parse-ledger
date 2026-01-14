import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPreferencesAndTokenVersion1735300000000 implements MigrationInterface {
  name = 'AddUserPreferencesAndTokenVersion1735300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "locale" varchar(8) NOT NULL DEFAULT 'ru'
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "time_zone" varchar(64)
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "token_version" int NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "token_version"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "time_zone"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "locale"`);
  }
}
