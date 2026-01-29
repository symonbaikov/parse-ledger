import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceReceiptsForTaxAndDuplicates1738056000000 implements MigrationInterface {
  name = 'EnhanceReceiptsForTaxAndDuplicates1738056000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "tax_amount" NUMERIC(10,2) NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "duplicate_of_id" UUID NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD COLUMN "is_duplicate" BOOLEAN NOT NULL DEFAULT false
    `);

    // Add foreign key constraint for duplicate_of_id
    await queryRunner.query(`
      ALTER TABLE "receipts"
      ADD CONSTRAINT "FK_receipts_duplicate_of_id"
      FOREIGN KEY ("duplicate_of_id")
      REFERENCES "receipts"("id")
      ON DELETE SET NULL
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_receipts_duplicate_of_id"
      ON "receipts" ("duplicate_of_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_receipts_is_duplicate"
      ON "receipts" ("is_duplicate")
    `);

    // Status values already included in initial receipts enum; no-op
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_receipts_is_duplicate"`);
    await queryRunner.query(`DROP INDEX "IDX_receipts_duplicate_of_id"`);

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "receipts"
      DROP CONSTRAINT "FK_receipts_duplicate_of_id"
    `);

    // Drop columns
    await queryRunner.query(`ALTER TABLE "receipts" DROP COLUMN "is_duplicate"`);
    await queryRunner.query(`ALTER TABLE "receipts" DROP COLUMN "duplicate_of_id"`);
    await queryRunner.query(`ALTER TABLE "receipts" DROP COLUMN "tax_amount"`);

    // Note: Cannot remove enum values in PostgreSQL, would need to recreate the enum type
  }
}
