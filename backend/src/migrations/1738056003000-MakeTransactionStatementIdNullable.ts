import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTransactionStatementIdNullable1738056003000 implements MigrationInterface {
  name = 'MakeTransactionStatementIdNullable1738056003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key constraint first
    await queryRunner.query(`
      ALTER TABLE "transactions"
      DROP CONSTRAINT IF EXISTS "FK_transactions_statement_id"
    `);

    // Make statement_id nullable to support transactions created from receipts
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "statement_id" DROP NOT NULL
    `);

    // Re-add the foreign key constraint with nullable support
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_statement_id"
      FOREIGN KEY ("statement_id")
      REFERENCES "statements"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "transactions"
      DROP CONSTRAINT "FK_transactions_statement_id"
    `);

    // Note: Cannot safely make column NOT NULL if there are records with NULL values
    // Delete transactions without statements first (only if reverting)
    await queryRunner.query(`
      DELETE FROM "transactions"
      WHERE "statement_id" IS NULL
    `);

    // Make statement_id NOT NULL again
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "statement_id" SET NOT NULL
    `);

    // Re-add the foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_statement_id"
      FOREIGN KEY ("statement_id")
      REFERENCES "statements"("id")
      ON DELETE CASCADE
    `);
  }
}
