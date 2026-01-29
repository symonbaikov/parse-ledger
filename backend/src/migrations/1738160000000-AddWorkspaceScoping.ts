import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceScoping1738160000000 implements MigrationInterface {
  name = 'AddWorkspaceScoping1738160000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add workspaceId to statements table
    await queryRunner.query(`
      ALTER TABLE "statements"
      ADD COLUMN "workspace_id" UUID
    `);

    // Populate workspaceId from user.workspaceId for existing records
    await queryRunner.query(`
      UPDATE "statements" s
      SET "workspace_id" = u."workspace_id"
      FROM "users" u
      WHERE s."user_id" = u."id"
      AND u."workspace_id" IS NOT NULL
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "statements"
      ADD CONSTRAINT "FK_statements_workspace"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE CASCADE
    `);

    // Create index for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_statements_workspace_id"
      ON "statements" ("workspace_id")
    `);

    // Add workspaceId to transactions table
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD COLUMN "workspace_id" UUID
    `);

    // Populate workspaceId from statement.workspaceId for existing records
    await queryRunner.query(`
      UPDATE "transactions" t
      SET "workspace_id" = s."workspace_id"
      FROM "statements" s
      WHERE t."statement_id" = s."id"
      AND s."workspace_id" IS NOT NULL
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_workspace"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE CASCADE
    `);

    // Create index
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_workspace_id"
      ON "transactions" ("workspace_id")
    `);

    // Add workspaceId to categories table
    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "workspace_id" UUID
    `);

    // Populate from user.workspaceId
    await queryRunner.query(`
      UPDATE "categories" c
      SET "workspace_id" = u."workspace_id"
      FROM "users" u
      WHERE c."user_id" = u."id"
      AND u."workspace_id" IS NOT NULL
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD CONSTRAINT "FK_categories_workspace"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
      ON DELETE CASCADE
    `);

    // Create index
    await queryRunner.query(`
      CREATE INDEX "IDX_categories_workspace_id"
      ON "categories" ("workspace_id")
    `);

    // Add workspaceId to google_sheets table (if exists)
    const googleSheetsTable = await queryRunner.hasTable('google_sheets');
    if (googleSheetsTable) {
      await queryRunner.query(`
        ALTER TABLE "google_sheets"
        ADD COLUMN "workspace_id" UUID
      `);

      await queryRunner.query(`
        UPDATE "google_sheets" g
        SET "workspace_id" = u."workspace_id"
        FROM "users" u
        WHERE g."user_id" = u."id"
        AND u."workspace_id" IS NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "google_sheets"
        ADD CONSTRAINT "FK_google_sheets_workspace"
        FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
        ON DELETE CASCADE
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_google_sheets_workspace_id"
        ON "google_sheets" ("workspace_id")
      `);
    }

    // Add workspaceId to custom_tables table (if exists)
    const customTablesTable = await queryRunner.hasTable('custom_tables');
    if (customTablesTable) {
      await queryRunner.query(`
        ALTER TABLE "custom_tables"
        ADD COLUMN "workspace_id" UUID
      `);

      await queryRunner.query(`
        UPDATE "custom_tables" ct
        SET "workspace_id" = u."workspace_id"
        FROM "users" u
        WHERE ct."user_id" = u."id"
        AND u."workspace_id" IS NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "custom_tables"
        ADD CONSTRAINT "FK_custom_tables_workspace"
        FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
        ON DELETE CASCADE
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_custom_tables_workspace_id"
        ON "custom_tables" ("workspace_id")
      `);
    }

    // Add workspaceId to folders table (if exists)
    const foldersTable = await queryRunner.hasTable('folders');
    if (foldersTable) {
      await queryRunner.query(`
        ALTER TABLE "folders"
        ADD COLUMN "workspace_id" UUID
      `);

      await queryRunner.query(`
        UPDATE "folders" f
        SET "workspace_id" = u."workspace_id"
        FROM "users" u
        WHERE f."user_id" = u."id"
        AND u."workspace_id" IS NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "folders"
        ADD CONSTRAINT "FK_folders_workspace"
        FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
        ON DELETE CASCADE
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_folders_workspace_id"
        ON "folders" ("workspace_id")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove workspaceId from all tables
    const tables = [
      'statements',
      'transactions',
      'categories',
      'google_sheets',
      'custom_tables',
      'folders',
    ];

    for (const table of tables) {
      const hasTable = await queryRunner.hasTable(table);
      if (hasTable) {
        await queryRunner.query(`
          DROP INDEX IF EXISTS "IDX_${table}_workspace_id"
        `);
        await queryRunner.query(`
          ALTER TABLE "${table}"
          DROP CONSTRAINT IF EXISTS "FK_${table}_workspace"
        `);
        await queryRunner.query(`
          ALTER TABLE "${table}"
          DROP COLUMN IF EXISTS "workspace_id"
        `);
      }
    }
  }
}
