import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaces1735200000000 implements MigrationInterface {
  name = 'AddWorkspaces1735200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workspaces" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "owner_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_workspaces_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workspace_members" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "workspace_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" varchar NOT NULL DEFAULT 'member',
        "invited_by_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_workspace_members_user" UNIQUE ("workspace_id", "user_id"),
        CONSTRAINT "FK_workspace_members_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_workspace_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_workspace_members_invited_by" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_workspace_members_workspace_id" ON "workspace_members" ("workspace_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_workspace_members_user_id" ON "workspace_members" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "workspace_invitations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "workspace_id" uuid NOT NULL,
        "email" varchar NOT NULL,
        "role" varchar NOT NULL DEFAULT 'member',
        "token" varchar NOT NULL UNIQUE,
        "status" varchar NOT NULL DEFAULT 'pending',
        "invited_by_id" uuid,
        "expires_at" TIMESTAMP,
        "accepted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_workspace_invitation_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_workspace_invitation_invited_by" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "workspace_id" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_workspace_id" ON "users" ("workspace_id")
    `);

    const users: Array<{ id: string; name: string | null; email: string }> =
      await queryRunner.query(`SELECT id, name, email FROM "users"`);

    for (const user of users) {
      const workspaceName =
        user.name?.trim() || user.email
          ? `${user.name?.trim() || user.email} workspace`
          : 'Personal workspace';

      const [{ id: workspaceId }] = await queryRunner.query(
        `INSERT INTO "workspaces" ("name", "owner_id") VALUES ($1, $2) RETURNING id`,
        [workspaceName, user.id],
      );

      await queryRunner.query(
        `UPDATE "users" SET "workspace_id" = $1 WHERE "id" = $2`,
        [workspaceId, user.id],
      );

      await queryRunner.query(
        `INSERT INTO "workspace_members" ("workspace_id", "user_id", "role", "invited_by_id")
         VALUES ($1, $2, 'owner', $2)
         ON CONFLICT DO NOTHING`,
        [workspaceId, user.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_workspace"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "workspace_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workspace_invitations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workspace_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workspaces"`);
  }
}
