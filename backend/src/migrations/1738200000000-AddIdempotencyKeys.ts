import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdempotencyKeys1738200000000 implements MigrationInterface {
  name = 'AddIdempotencyKeys1738200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "idempotency_keys" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "key" character varying(255) NOT NULL,
        "user_id" uuid NOT NULL,
        "workspace_id" uuid,
        "response_hash" character varying(64) NOT NULL,
        "response_data" jsonb NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "expires_at" TIMESTAMP NOT NULL,
        CONSTRAINT "UQ_idempotency_key_user_workspace" UNIQUE ("key", "user_id", "workspace_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_idempotency_keys_key" ON "idempotency_keys" ("key")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_idempotency_keys_expires_at" ON "idempotency_keys" ("expires_at")
    `);

    await queryRunner.query(`
      ALTER TABLE "idempotency_keys"
      ADD CONSTRAINT "FK_idempotency_keys_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "idempotency_keys"
      ADD CONSTRAINT "FK_idempotency_keys_workspace"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
    `);

    // Add parsing_attempts column to statements
    await queryRunner.query(`
      ALTER TABLE "statements" ADD "parsing_attempts" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "statements" DROP COLUMN "parsing_attempts"`);
    await queryRunner.query(`DROP TABLE "idempotency_keys"`);
  }
}
