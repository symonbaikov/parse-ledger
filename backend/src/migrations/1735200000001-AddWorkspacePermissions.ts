import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspacePermissions1735200000001 implements MigrationInterface {
  name = 'AddWorkspacePermissions1735200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "workspace_members"
      ADD COLUMN IF NOT EXISTS "permissions" jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "workspace_invitations"
      ADD COLUMN IF NOT EXISTS "permissions" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workspace_invitations" DROP COLUMN IF EXISTS "permissions"`,
    );
    await queryRunner.query(`ALTER TABLE "workspace_members" DROP COLUMN IF EXISTS "permissions"`);
  }
}
