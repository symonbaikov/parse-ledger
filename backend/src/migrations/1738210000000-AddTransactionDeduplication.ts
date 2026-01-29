import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionDeduplication1738210000000 implements MigrationInterface {
  name = 'AddTransactionDeduplication1738210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add duplicate tracking columns
    await queryRunner.query(`
      ALTER TABLE "transactions" ADD "is_duplicate" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" ADD "duplicate_of_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" ADD "duplicate_confidence" numeric(3,2)
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" ADD "duplicate_match_type" character varying(50)
    `);

    // Add foreign key for duplicate_of_id
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_duplicate_of"
      FOREIGN KEY ("duplicate_of_id") REFERENCES "transactions"("id") ON DELETE SET NULL
    `);

    // Create index for efficient duplicate queries
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_duplicate" ON "transactions" ("is_duplicate", "duplicate_of_id")
    `);

    // Create composite index for deduplication queries (workspace + date + amount)
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_dedup_search" ON "transactions" ("workspace_id", "transaction_date", "debit", "credit")
    `);

    // Create index for counterparty name (fuzzy matching)
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_counterparty_name" ON "transactions" ("counterparty_name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_transactions_counterparty_name"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_dedup_search"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_duplicate"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_duplicate_of"`,
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "duplicate_match_type"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "duplicate_confidence"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "duplicate_of_id"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "is_duplicate"`);
  }
}
