import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceMetadata1738156800000 implements MigrationInterface {
  name = 'AddWorkspaceMetadata1738156800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add workspace metadata columns
    await queryRunner.query(`
      ALTER TABLE "workspaces"
      ADD COLUMN "description" VARCHAR(500),
      ADD COLUMN "icon" VARCHAR(50),
      ADD COLUMN "color" VARCHAR(7),
      ADD COLUMN "settings" JSONB
    `);

    // Add lastWorkspaceId to users table
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "last_workspace_id" UUID
    `);

    // Add workspace member activity tracking columns
    await queryRunner.query(`
      ALTER TABLE "workspace_members"
      ADD COLUMN "last_accessed_at" TIMESTAMP,
      ADD COLUMN "access_count" INTEGER NOT NULL DEFAULT 0
    `);

    // Populate lastWorkspaceId from existing workspaceId for all users
    await queryRunner.query(`
      UPDATE "users"
      SET "last_workspace_id" = "workspace_id"
      WHERE "workspace_id" IS NOT NULL
    `);

    // No enum modification required: role is stored as VARCHAR
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove workspace metadata columns
    await queryRunner.query(`
      ALTER TABLE "workspaces"
      DROP COLUMN IF EXISTS "description",
      DROP COLUMN IF EXISTS "icon",
      DROP COLUMN IF EXISTS "color",
      DROP COLUMN IF EXISTS "settings"
    `);

    // Remove lastWorkspaceId from users
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "last_workspace_id"
    `);

    // Remove workspace member activity tracking columns
    await queryRunner.query(`
      ALTER TABLE "workspace_members"
      DROP COLUMN IF EXISTS "last_accessed_at",
      DROP COLUMN IF EXISTS "access_count"
    `);

    // Note: Cannot remove enum value in PostgreSQL without recreating the type
  }
}
