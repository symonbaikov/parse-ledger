import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTagToFolders1735600000000 implements MigrationInterface {
  name = 'AddTagToFolders1735600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "folders"
      ADD COLUMN IF NOT EXISTS "tag_id" uuid
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'fk_folders_tag_id'
        ) THEN
          ALTER TABLE "folders"
          ADD CONSTRAINT "fk_folders_tag_id"
          FOREIGN KEY ("tag_id") REFERENCES "tags"("id")
          ON DELETE SET NULL;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "folders"
      DROP CONSTRAINT IF EXISTS "fk_folders_tag_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "folders"
      DROP COLUMN IF EXISTS "tag_id"
    `);
  }
}
