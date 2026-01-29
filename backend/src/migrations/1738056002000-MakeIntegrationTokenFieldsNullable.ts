import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeIntegrationTokenFieldsNullable1738056002000 implements MigrationInterface {
  name = 'MakeIntegrationTokenFieldsNullable1738056002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure encrypted token columns exist before backfilling
    await queryRunner.query(`
      ALTER TABLE "integration_tokens"
      ADD COLUMN IF NOT EXISTS "encrypted_access_token" text
    `);

    await queryRunner.query(`
      ALTER TABLE "integration_tokens"
      ADD COLUMN IF NOT EXISTS "encrypted_refresh_token" text
    `);
    // Make access_token and refresh_token nullable to support encrypted-only storage
    await queryRunner.query(`
      ALTER TABLE "integration_tokens"
      ALTER COLUMN "access_token" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "integration_tokens"
      ALTER COLUMN "refresh_token" DROP NOT NULL
    `);

    // Backfill: Copy plain tokens to encrypted fields if encrypted fields are empty
    // This handles existing records that might only have plain tokens
    await queryRunner.query(`
      UPDATE "integration_tokens"
      SET "encrypted_access_token" = "access_token"
      WHERE "encrypted_access_token" IS NULL AND "access_token" IS NOT NULL
    `);

    await queryRunner.query(`
      UPDATE "integration_tokens"
      SET "encrypted_refresh_token" = "refresh_token"
      WHERE "encrypted_refresh_token" IS NULL AND "refresh_token" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Backfill plain fields from encrypted fields before making them NOT NULL again
    await queryRunner.query(`
      UPDATE "integration_tokens"
      SET "access_token" = "encrypted_access_token"
      WHERE "access_token" IS NULL AND "encrypted_access_token" IS NOT NULL
    `);

    await queryRunner.query(`
      UPDATE "integration_tokens"
      SET "refresh_token" = "encrypted_refresh_token"
      WHERE "refresh_token" IS NULL AND "encrypted_refresh_token" IS NOT NULL
    `);

    // Make columns NOT NULL again
    await queryRunner.query(`
      ALTER TABLE "integration_tokens"
      ALTER COLUMN "access_token" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "integration_tokens"
      ALTER COLUMN "refresh_token" SET NOT NULL
    `);
    // Optionally drop encrypted columns (leave data migration to operators)
    await queryRunner.query(`
      ALTER TABLE "integration_tokens"
      DROP COLUMN IF EXISTS "encrypted_access_token"
    `);

    await queryRunner.query(`
      ALTER TABLE "integration_tokens"
      DROP COLUMN IF EXISTS "encrypted_refresh_token"
    `);
  }
}
