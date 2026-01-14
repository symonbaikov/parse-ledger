import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class InitBaseSchema1733000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    const hasUsers = await queryRunner.hasTable('users');
    if (!hasUsers) {
      await queryRunner.createTable(
        new Table({
          name: 'users',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'email', type: 'varchar', isUnique: true },
            { name: 'password_hash', type: 'varchar' },
            { name: 'name', type: 'varchar' },
            { name: 'company', type: 'varchar', isNullable: true },
            {
              name: 'role',
              type: 'enum',
              enum: ['admin', 'user', 'viewer'],
              enumName: 'user_role_enum',
              default: "'user'",
            },
            { name: 'google_id', type: 'varchar', isNullable: true },
            { name: 'telegram_id', type: 'varchar', isNullable: true },
            { name: 'telegram_chat_id', type: 'varchar', isNullable: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
            { name: 'last_login', type: 'timestamp', isNullable: true },
            { name: 'is_active', type: 'boolean', default: true },
            { name: 'permissions', type: 'jsonb', isNullable: true },
          ],
        }),
        true,
      );
    }

    const hasCategories = await queryRunner.hasTable('categories');
    if (!hasCategories) {
      await queryRunner.createTable(
        new Table({
          name: 'categories',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'user_id', type: 'uuid', isNullable: true },
            { name: 'name', type: 'varchar' },
            {
              name: 'type',
              type: 'enum',
              enum: ['income', 'expense'],
              enumName: 'category_type_enum',
            },
            { name: 'parent_id', type: 'uuid', isNullable: true },
            { name: 'is_system', type: 'boolean', default: false },
            { name: 'color', type: 'varchar', isNullable: true },
            { name: 'icon', type: 'varchar', isNullable: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
            },
            {
              columnNames: ['parent_id'],
              referencedTableName: 'categories',
              referencedColumnNames: ['id'],
            },
          ],
        }),
        true,
      );
    }

    const hasBranches = await queryRunner.hasTable('branches');
    if (!hasBranches) {
      await queryRunner.createTable(
        new Table({
          name: 'branches',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'user_id', type: 'uuid' },
            { name: 'name', type: 'varchar' },
            { name: 'code', type: 'varchar', isNullable: true },
            { name: 'address', type: 'varchar', isNullable: true },
            { name: 'is_active', type: 'boolean', default: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
            },
          ],
        }),
        true,
      );
    }

    const hasWallets = await queryRunner.hasTable('wallets');
    if (!hasWallets) {
      await queryRunner.createTable(
        new Table({
          name: 'wallets',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'user_id', type: 'uuid' },
            { name: 'name', type: 'varchar' },
            { name: 'account_number', type: 'varchar', isNullable: true },
            { name: 'bank_name', type: 'varchar', isNullable: true },
            { name: 'currency', type: 'varchar', default: "'KZT'" },
            {
              name: 'initial_balance',
              type: 'decimal',
              precision: 15,
              scale: 2,
              default: "'0'",
            },
            { name: 'is_active', type: 'boolean', default: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
            },
          ],
        }),
        true,
      );
    }

    const hasGoogleSheets = await queryRunner.hasTable('google_sheets');
    if (!hasGoogleSheets) {
      await queryRunner.createTable(
        new Table({
          name: 'google_sheets',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'user_id', type: 'uuid' },
            { name: 'sheet_id', type: 'varchar' },
            { name: 'sheet_name', type: 'varchar' },
            { name: 'worksheet_name', type: 'varchar', isNullable: true },
            { name: 'access_token', type: 'text' },
            { name: 'refresh_token', type: 'text' },
            { name: 'is_active', type: 'boolean', default: true },
            { name: 'last_sync', type: 'timestamp', isNullable: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
            },
          ],
        }),
        true,
      );
    }

    const hasStatements = await queryRunner.hasTable('statements');
    if (!hasStatements) {
      await queryRunner.createTable(
        new Table({
          name: 'statements',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'user_id', type: 'uuid' },
            { name: 'google_sheet_id', type: 'uuid', isNullable: true },
            { name: 'file_name', type: 'varchar' },
            { name: 'file_path', type: 'varchar' },
            {
              name: 'file_type',
              type: 'enum',
              enum: ['pdf', 'xlsx', 'csv', 'image'],
              enumName: 'file_type_enum',
            },
            { name: 'file_size', type: 'integer' },
            { name: 'file_hash', type: 'varchar', isUnique: true },
            {
              name: 'bank_name',
              type: 'enum',
              enum: ['bereke_new', 'bereke_old', 'kaspi', 'other'],
              enumName: 'bank_name_enum',
            },
            { name: 'account_number', type: 'varchar', isNullable: true },
            { name: 'statement_date_from', type: 'date', isNullable: true },
            { name: 'statement_date_to', type: 'date', isNullable: true },
            {
              name: 'status',
              type: 'enum',
              enum: ['uploaded', 'processing', 'parsed', 'validated', 'completed', 'error'],
              enumName: 'statement_status_enum',
              default: "'uploaded'",
            },
            { name: 'error_message', type: 'text', isNullable: true },
            { name: 'total_transactions', type: 'integer', default: "'0'" },
            {
              name: 'total_debit',
              type: 'decimal',
              precision: 15,
              scale: 2,
              default: "'0'",
            },
            {
              name: 'total_credit',
              type: 'decimal',
              precision: 15,
              scale: 2,
              default: "'0'",
            },
            {
              name: 'balance_start',
              type: 'decimal',
              precision: 15,
              scale: 2,
              isNullable: true,
            },
            {
              name: 'balance_end',
              type: 'decimal',
              precision: 15,
              scale: 2,
              isNullable: true,
            },
            { name: 'currency', type: 'varchar', default: "'KZT'" },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
            { name: 'processed_at', type: 'timestamp', isNullable: true },
            { name: 'parsing_details', type: 'jsonb', isNullable: true },
          ],
          foreignKeys: [
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
            },
            {
              columnNames: ['google_sheet_id'],
              referencedTableName: 'google_sheets',
              referencedColumnNames: ['id'],
            },
          ],
        }),
        true,
      );
    }

    const hasTransactions = await queryRunner.hasTable('transactions');
    if (!hasTransactions) {
      await queryRunner.createTable(
        new Table({
          name: 'transactions',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'statement_id', type: 'uuid' },
            { name: 'transaction_date', type: 'date' },
            { name: 'document_number', type: 'varchar', isNullable: true },
            { name: 'counterparty_name', type: 'varchar' },
            { name: 'counterparty_bin', type: 'varchar', isNullable: true },
            { name: 'counterparty_account', type: 'varchar', isNullable: true },
            { name: 'counterparty_bank', type: 'varchar', isNullable: true },
            { name: 'debit', type: 'decimal', precision: 15, scale: 2, isNullable: true },
            { name: 'credit', type: 'decimal', precision: 15, scale: 2, isNullable: true },
            { name: 'amount', type: 'decimal', precision: 15, scale: 2, isNullable: true },
            { name: 'currency', type: 'varchar', default: "'KZT'" },
            { name: 'exchange_rate', type: 'decimal', precision: 10, scale: 4, isNullable: true },
            { name: 'amount_foreign', type: 'decimal', precision: 15, scale: 2, isNullable: true },
            { name: 'payment_purpose', type: 'text' },
            { name: 'category_id', type: 'uuid', isNullable: true },
            { name: 'branch_id', type: 'uuid', isNullable: true },
            { name: 'wallet_id', type: 'uuid', isNullable: true },
            { name: 'article', type: 'varchar', isNullable: true },
            { name: 'activity_type', type: 'varchar', isNullable: true },
            {
              name: 'transaction_type',
              type: 'enum',
              enum: ['income', 'expense'],
              enumName: 'transaction_type_enum',
            },
            { name: 'comments', type: 'text', isNullable: true },
            { name: 'is_verified', type: 'boolean', default: false },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['statement_id'],
              referencedTableName: 'statements',
              referencedColumnNames: ['id'],
            },
            {
              columnNames: ['category_id'],
              referencedTableName: 'categories',
              referencedColumnNames: ['id'],
            },
            {
              columnNames: ['branch_id'],
              referencedTableName: 'branches',
              referencedColumnNames: ['id'],
            },
            {
              columnNames: ['wallet_id'],
              referencedTableName: 'wallets',
              referencedColumnNames: ['id'],
            },
          ],
        }),
        true,
      );
    }

    const hasParsingRules = await queryRunner.hasTable('parsing_rules');
    if (!hasParsingRules) {
      await queryRunner.createTable(
        new Table({
          name: 'parsing_rules',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'bank_name',
              type: 'enum',
              enum: ['bereke_new', 'bereke_old', 'kaspi', 'other'],
              enumName: 'bank_name_enum',
            },
            { name: 'format_version', type: 'varchar' },
            { name: 'column_mappings', type: 'jsonb' },
            { name: 'validation_rules', type: 'jsonb' },
            { name: 'is_active', type: 'boolean', default: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
    }

    const hasAuditLogs = await queryRunner.hasTable('audit_logs');
    if (!hasAuditLogs) {
      await queryRunner.createTable(
        new Table({
          name: 'audit_logs',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'user_id', type: 'uuid', isNullable: true },
            {
              name: 'action',
              type: 'enum',
              enum: [
                'statement.upload',
                'statement.delete',
                'transaction.update',
                'category.create',
                'category.update',
                'category.delete',
                'branch.create',
                'branch.update',
                'branch.delete',
                'wallet.create',
                'wallet.update',
                'wallet.delete',
                'report.generate',
              ],
              enumName: 'audit_action_enum',
            },
            { name: 'description', type: 'text', isNullable: true },
            { name: 'metadata', type: 'jsonb', isNullable: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
            },
          ],
        }),
        true,
      );
    }

    const hasSharedLinks = await queryRunner.hasTable('shared_links');
    if (!hasSharedLinks) {
      await queryRunner.createTable(
        new Table({
          name: 'shared_links',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'statement_id', type: 'uuid' },
            { name: 'user_id', type: 'uuid' },
            { name: 'token', type: 'varchar', length: '64', isUnique: true },
            {
              name: 'permission',
              type: 'enum',
              enum: ['view', 'download', 'edit'],
              enumName: 'share_permission_level',
              default: "'view'",
            },
            { name: 'expires_at', type: 'timestamp', isNullable: true },
            { name: 'password', type: 'varchar', isNullable: true },
            {
              name: 'status',
              type: 'enum',
              enum: ['active', 'expired', 'revoked'],
              enumName: 'share_link_status',
              default: "'active'",
            },
            { name: 'access_count', type: 'integer', default: "'0'" },
            { name: 'last_accessed_at', type: 'timestamp', isNullable: true },
            { name: 'allow_anonymous', type: 'boolean', default: true },
            { name: 'description', type: 'text', isNullable: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['statement_id'],
              referencedTableName: 'statements',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
        }),
        true,
      );
    }

    const hasFilePermissions = await queryRunner.hasTable('file_permissions');
    if (!hasFilePermissions) {
      await queryRunner.createTable(
        new Table({
          name: 'file_permissions',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'statement_id', type: 'uuid' },
            { name: 'user_id', type: 'uuid' },
            { name: 'granted_by_id', type: 'uuid' },
            {
              name: 'permission_type',
              type: 'enum',
              enum: ['owner', 'editor', 'viewer', 'downloader'],
              enumName: 'file_permission_type',
              default: "'viewer'",
            },
            { name: 'can_reshare', type: 'boolean', default: false },
            { name: 'expires_at', type: 'timestamp', isNullable: true },
            { name: 'is_active', type: 'boolean', default: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
          uniques: [
            {
              columnNames: ['statement_id', 'user_id'],
            },
          ],
          foreignKeys: [
            {
              columnNames: ['statement_id'],
              referencedTableName: 'statements',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
            {
              columnNames: ['granted_by_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
        }),
        true,
      );
    }

    const hasTelegramReports = await queryRunner.hasTable('telegram_reports');
    if (!hasTelegramReports) {
      await queryRunner.createTable(
        new Table({
          name: 'telegram_reports',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'user_id', type: 'uuid' },
            { name: 'chat_id', type: 'varchar' },
            {
              name: 'report_type',
              type: 'enum',
              enum: ['daily', 'monthly', 'custom'],
              enumName: 'telegram_report_type',
            },
            { name: 'report_date', type: 'date' },
            { name: 'sent_at', type: 'timestamp', isNullable: true },
            {
              name: 'status',
              type: 'enum',
              enum: ['pending', 'sent', 'failed'],
              enumName: 'telegram_report_status',
              default: "'pending'",
            },
            { name: 'message_id', type: 'varchar', isNullable: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
        }),
        true,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const dropTableIfExists = async (tableName: string) => {
      const hasTable = await queryRunner.hasTable(tableName);
      if (hasTable) {
        await queryRunner.dropTable(tableName);
      }
    };

    await dropTableIfExists('telegram_reports');
    await dropTableIfExists('file_permissions');
    await dropTableIfExists('shared_links');
    await dropTableIfExists('audit_logs');
    await dropTableIfExists('parsing_rules');
    await dropTableIfExists('transactions');
    await dropTableIfExists('statements');
    await dropTableIfExists('google_sheets');
    await dropTableIfExists('wallets');
    await dropTableIfExists('branches');
    await dropTableIfExists('categories');
    await dropTableIfExists('users');

    await queryRunner.query('DROP TYPE IF EXISTS "telegram_report_status"');
    await queryRunner.query('DROP TYPE IF EXISTS "telegram_report_type"');
    await queryRunner.query('DROP TYPE IF EXISTS "file_permission_type"');
    await queryRunner.query('DROP TYPE IF EXISTS "share_link_status"');
    await queryRunner.query('DROP TYPE IF EXISTS "share_permission_level"');
    await queryRunner.query('DROP TYPE IF EXISTS "audit_action_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "transaction_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "statement_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "bank_name_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "file_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "category_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "user_role_enum"');
  }
}
