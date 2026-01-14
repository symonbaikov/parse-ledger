import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddStorageEntities1733328000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create shared_links table
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
          {
            name: 'statement_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '64',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'permission',
            type: 'enum',
            enum: ['view', 'download', 'edit'],
            default: "'view'",
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'expired', 'revoked'],
            default: "'active'",
          },
          {
            name: 'access_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'last_accessed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'allow_anonymous',
            type: 'boolean',
            default: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create indexes for shared_links
    await queryRunner.createIndex(
      'shared_links',
      new TableIndex({
        name: 'IDX_shared_links_token',
        columnNames: ['token'],
      }),
    );

    await queryRunner.createIndex(
      'shared_links',
      new TableIndex({
        name: 'IDX_shared_links_statement_id',
        columnNames: ['statement_id'],
      }),
    );

    await queryRunner.createIndex(
      'shared_links',
      new TableIndex({
        name: 'IDX_shared_links_user_id',
        columnNames: ['user_id'],
      }),
    );

    // Create foreign keys for shared_links (if table exists and constraint doesn't)
    const sharedLinksTable = await queryRunner.getTable('shared_links');
    if (sharedLinksTable) {
      const hasFk1 = sharedLinksTable.foreignKeys.some(
        fk => fk.columnNames.includes('statement_id') && fk.referencedTableName === 'statements',
      );
      if (!hasFk1) {
        await queryRunner.createForeignKey(
          'shared_links',
          new TableForeignKey({
            columnNames: ['statement_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'statements',
            onDelete: 'CASCADE',
          }),
        );
      }

      const hasFk2 = sharedLinksTable.foreignKeys.some(
        fk => fk.columnNames.includes('user_id') && fk.referencedTableName === 'users',
      );
      if (!hasFk2) {
        await queryRunner.createForeignKey(
          'shared_links',
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
        );
      }
    }

    // Create file_permissions table
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
          {
            name: 'statement_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'granted_by_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'permission_type',
            type: 'enum',
            enum: ['owner', 'editor', 'viewer', 'downloader'],
            default: "'viewer'",
          },
          {
            name: 'can_reshare',
            type: 'boolean',
            default: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create unique constraint on statement_id + user_id
    await queryRunner.createIndex(
      'file_permissions',
      new TableIndex({
        name: 'IDX_file_permissions_statement_user_unique',
        columnNames: ['statement_id', 'user_id'],
        isUnique: true,
      }),
    );

    // Create indexes for file_permissions
    await queryRunner.createIndex(
      'file_permissions',
      new TableIndex({
        name: 'IDX_file_permissions_statement_id',
        columnNames: ['statement_id'],
      }),
    );

    await queryRunner.createIndex(
      'file_permissions',
      new TableIndex({
        name: 'IDX_file_permissions_user_id',
        columnNames: ['user_id'],
      }),
    );

    // Create foreign keys for file_permissions (if table exists and constraint doesn't)
    const filePermissionsTable = await queryRunner.getTable('file_permissions');
    if (filePermissionsTable) {
      const hasFk1 = filePermissionsTable.foreignKeys.some(
        fk => fk.columnNames.includes('statement_id') && fk.referencedTableName === 'statements',
      );
      if (!hasFk1) {
        await queryRunner.createForeignKey(
          'file_permissions',
          new TableForeignKey({
            columnNames: ['statement_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'statements',
            onDelete: 'CASCADE',
          }),
        );
      }

      const hasFk2 = filePermissionsTable.foreignKeys.some(
        fk => fk.columnNames.includes('user_id') && fk.referencedTableName === 'users',
      );
      if (!hasFk2) {
        await queryRunner.createForeignKey(
          'file_permissions',
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
        );
      }

      const hasFk3 = filePermissionsTable.foreignKeys.some(
        fk => fk.columnNames.includes('granted_by_id') && fk.referencedTableName === 'users',
      );
      if (!hasFk3) {
        await queryRunner.createForeignKey(
          'file_permissions',
          new TableForeignKey({
            columnNames: ['granted_by_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop file_permissions table
    await queryRunner.dropTable('file_permissions');

    // Drop shared_links table
    await queryRunner.dropTable('shared_links');
  }
}
