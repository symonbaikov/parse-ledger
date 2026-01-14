import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class AddCustomTables1734400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasCustomTables = await queryRunner.hasTable('custom_tables');
    if (!hasCustomTables) {
      await queryRunner.createTable(
        new Table({
          name: 'custom_tables',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'user_id', type: 'uuid', isNullable: false },
            { name: 'name', type: 'varchar', isNullable: false },
            { name: 'description', type: 'text', isNullable: true },
            {
              name: 'source',
              type: 'enum',
              enum: ['manual', 'google_sheets_import'],
              enumName: 'custom_table_source_enum',
              default: "'manual'",
            },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
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
      );

      await queryRunner.createIndex(
        'custom_tables',
        new TableIndex({
          name: 'IDX_custom_tables_user_created_at',
          columnNames: ['user_id', 'created_at'],
        }),
      );
    }

    const hasCustomTableColumns = await queryRunner.hasTable('custom_table_columns');
    if (!hasCustomTableColumns) {
      await queryRunner.createTable(
        new Table({
          name: 'custom_table_columns',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'table_id', type: 'uuid', isNullable: false },
            { name: 'key', type: 'varchar', isNullable: false },
            { name: 'title', type: 'varchar', isNullable: false },
            {
              name: 'type',
              type: 'enum',
              enum: ['text', 'number', 'date', 'boolean', 'select', 'multi_select'],
              enumName: 'custom_table_column_type_enum',
              default: "'text'",
            },
            { name: 'is_required', type: 'boolean', default: false },
            { name: 'is_unique', type: 'boolean', default: false },
            { name: 'position', type: 'int', default: 0 },
            { name: 'config', type: 'jsonb', isNullable: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['table_id'],
              referencedTableName: 'custom_tables',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
        }),
      );

      await queryRunner.createIndex(
        'custom_table_columns',
        new TableIndex({
          name: 'IDX_custom_table_columns_table_position',
          columnNames: ['table_id', 'position'],
        }),
      );

      await queryRunner.createIndex(
        'custom_table_columns',
        new TableIndex({
          name: 'IDX_custom_table_columns_table_key_unique',
          columnNames: ['table_id', 'key'],
          isUnique: true,
        }),
      );
    }

    const hasCustomTableRows = await queryRunner.hasTable('custom_table_rows');
    if (!hasCustomTableRows) {
      await queryRunner.createTable(
        new Table({
          name: 'custom_table_rows',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'table_id', type: 'uuid', isNullable: false },
            { name: 'row_number', type: 'int', isNullable: false },
            { name: 'data', type: 'jsonb', default: "'{}'::jsonb" },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
          foreignKeys: [
            {
              columnNames: ['table_id'],
              referencedTableName: 'custom_tables',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
        }),
      );

      await queryRunner.createIndex(
        'custom_table_rows',
        new TableIndex({
          name: 'IDX_custom_table_rows_table_row_number_unique',
          columnNames: ['table_id', 'row_number'],
          isUnique: true,
        }),
      );

      await queryRunner.createIndex(
        'custom_table_rows',
        new TableIndex({
          name: 'IDX_custom_table_rows_table_id',
          columnNames: ['table_id'],
        }),
      );

      await queryRunner.query(
        'CREATE INDEX IF NOT EXISTS "IDX_custom_table_rows_data_gin" ON "custom_table_rows" USING GIN ("data")',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasCustomTableRows = await queryRunner.hasTable('custom_table_rows');
    if (hasCustomTableRows) {
      await queryRunner.dropTable('custom_table_rows');
    }

    const hasCustomTableColumns = await queryRunner.hasTable('custom_table_columns');
    if (hasCustomTableColumns) {
      await queryRunner.dropTable('custom_table_columns');
    }

    const hasCustomTables = await queryRunner.hasTable('custom_tables');
    if (hasCustomTables) {
      await queryRunner.dropTable('custom_tables');
    }

    await queryRunner.query('DROP TYPE IF EXISTS "custom_table_column_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "custom_table_source_enum"');
  }
}
