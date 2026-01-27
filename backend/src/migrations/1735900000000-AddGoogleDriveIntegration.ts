import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleDriveIntegration1735900000000 implements MigrationInterface {
  name = 'AddGoogleDriveIntegration1735900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "integrations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "workspace_id" uuid,
        "provider" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'connected',
        "scopes" jsonb,
        "connected_by_user_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_integrations_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_integrations_user" FOREIGN KEY ("connected_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_integrations_workspace_provider"
      ON "integrations" ("workspace_id", "provider")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "integration_tokens" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "integration_id" uuid NOT NULL UNIQUE,
        "access_token" text NOT NULL,
        "refresh_token" text NOT NULL,
        "expires_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_integration_tokens_integration" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "drive_settings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "integration_id" uuid NOT NULL UNIQUE,
        "folder_id" varchar,
        "folder_name" varchar,
        "sync_enabled" boolean NOT NULL DEFAULT true,
        "sync_time" varchar(5) NOT NULL DEFAULT '03:00',
        "time_zone" varchar(64),
        "last_sync_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_drive_settings_integration" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_integration_tokens_integration_id"
      ON "integration_tokens" ("integration_id")
    `);

    await queryRunner.query(`
      ALTER TYPE "statements_file_type_enum"
      ADD VALUE IF NOT EXISTS 'docx'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "drive_settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "integration_tokens"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_integrations_workspace_provider"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "integrations"`);
  }
}
