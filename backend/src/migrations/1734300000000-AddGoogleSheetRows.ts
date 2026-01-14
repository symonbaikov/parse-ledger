import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddGoogleSheetRows1734300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('sheet_rows');
    if (!hasTable) {
      await queryRunner.createTable(
        new Table({
          name: 'sheet_rows',
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
            { name: 'spreadsheet_id', type: 'varchar' },
            { name: 'sheet_name', type: 'varchar' },
            { name: 'row_number', type: 'int' },
            { name: 'col_b', type: 'text', isNullable: true },
            { name: 'col_c', type: 'text', isNullable: true },
            { name: 'col_f', type: 'text', isNullable: true },
            { name: 'last_edited_at', type: 'timestamp', isNullable: true },
            { name: 'edited_by', type: 'varchar', isNullable: true },
            { name: 'edited_column', type: 'int', isNullable: true },
            { name: 'edited_cell', type: 'varchar', isNullable: true },
            { name: 'last_event_id', type: 'varchar', isNullable: true },
            { name: 'created_at', type: 'timestamp', default: 'now()' },
            { name: 'updated_at', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );

      await queryRunner.createForeignKey(
        'sheet_rows',
        new TableForeignKey({
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );

      await queryRunner.createForeignKey(
        'sheet_rows',
        new TableForeignKey({
          columnNames: ['google_sheet_id'],
          referencedTableName: 'google_sheets',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );

      await queryRunner.createIndex(
        'sheet_rows',
        new TableIndex({
          name: 'IDX_sheet_rows_unique',
          columnNames: ['spreadsheet_id', 'sheet_name', 'row_number'],
          isUnique: true,
        }),
      );

      await queryRunner.createIndex(
        'sheet_rows',
        new TableIndex({
          name: 'IDX_sheet_rows_user',
          columnNames: ['user_id'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('sheet_rows');
    if (hasTable) {
      await queryRunner.dropTable('sheet_rows');
    }
  }
}
