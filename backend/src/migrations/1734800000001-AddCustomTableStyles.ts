import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class AddCustomTableStyles1734800000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumnStyles = await queryRunner.hasTable('custom_table_column_styles');
    if (!hasColumnStyles) {
      await queryRunner.createTable(
        new Table({
          name: 'custom_table_column_styles',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'table_id', type: 'uuid', isNullable: false },
            { name: 'column_key', type: 'varchar', isNullable: false },
            { name: 'style', type: 'jsonb', default: "'{}'::jsonb" },
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
        'custom_table_column_styles',
        new TableIndex({
          name: 'IDX_custom_table_column_styles_table_id',
          columnNames: ['table_id'],
        }),
      );

      await queryRunner.createIndex(
        'custom_table_column_styles',
        new TableIndex({
          name: 'IDX_custom_table_column_styles_table_column_key_unique',
          columnNames: ['table_id', 'column_key'],
          isUnique: true,
        }),
      );
    }

    const hasCellStyles = await queryRunner.hasTable('custom_table_cell_styles');
    if (!hasCellStyles) {
      await queryRunner.createTable(
        new Table({
          name: 'custom_table_cell_styles',
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
            { name: 'column_key', type: 'varchar', isNullable: false },
            { name: 'style', type: 'jsonb', default: "'{}'::jsonb" },
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
        'custom_table_cell_styles',
        new TableIndex({
          name: 'IDX_custom_table_cell_styles_table_id',
          columnNames: ['table_id'],
        }),
      );

      await queryRunner.createIndex(
        'custom_table_cell_styles',
        new TableIndex({
          name: 'IDX_custom_table_cell_styles_table_row_col_unique',
          columnNames: ['table_id', 'row_number', 'column_key'],
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasCellStyles = await queryRunner.hasTable('custom_table_cell_styles');
    if (hasCellStyles) {
      await queryRunner.dropTable('custom_table_cell_styles');
    }

    const hasColumnStyles = await queryRunner.hasTable('custom_table_column_styles');
    if (hasColumnStyles) {
      await queryRunner.dropTable('custom_table_column_styles');
    }
  }
}
