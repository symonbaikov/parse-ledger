import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDropboxIntegration1736000000000 implements MigrationInterface {
  name = 'AddDropboxIntegration1736000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "dropbox_settings" (
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
        CONSTRAINT "FK_dropbox_settings_integration" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_dropbox_settings_integration_id"
      ON "dropbox_settings" ("integration_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_dropbox_settings_integration_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dropbox_settings"`);
  }
}
