import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategorizationRules1738220000000 implements MigrationInterface {
  name = 'AddCategorizationRules1738220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categorization_rules" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "workspace_id" uuid,
        "name" character varying(255) NOT NULL,
        "description" text,
        "conditions" jsonb NOT NULL,
        "result" jsonb NOT NULL,
        "priority" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "match_count" integer NOT NULL DEFAULT 0,
        "last_matched_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_categorization_rules_user" ON "categorization_rules" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_categorization_rules_workspace" ON "categorization_rules" ("workspace_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_categorization_rules_priority" ON "categorization_rules" ("priority" DESC)
    `);

    await queryRunner.query(`
      ALTER TABLE "categorization_rules"
      ADD CONSTRAINT "FK_categorization_rules_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "categorization_rules"
      ADD CONSTRAINT "FK_categorization_rules_workspace"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categorization_rules" DROP CONSTRAINT "FK_categorization_rules_workspace"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorization_rules" DROP CONSTRAINT "FK_categorization_rules_user"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_categorization_rules_priority"`);
    await queryRunner.query(`DROP INDEX "IDX_categorization_rules_workspace"`);
    await queryRunner.query(`DROP INDEX "IDX_categorization_rules_user"`);
    await queryRunner.query(`DROP TABLE "categorization_rules"`);
  }
}
