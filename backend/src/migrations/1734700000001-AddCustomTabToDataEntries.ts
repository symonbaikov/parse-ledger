import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddCustomTabToDataEntries1734700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('data_entries', 'custom_tab_id');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'data_entries',
        new TableColumn({
          name: 'custom_tab_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    const table = await queryRunner.getTable('data_entries');
    const fkExists = (table?.foreignKeys || []).some((fk) => fk.columnNames.includes('custom_tab_id'));
    if (!fkExists) {
      await queryRunner.createForeignKey(
        'data_entries',
        new TableForeignKey({
          columnNames: ['custom_tab_id'],
          referencedTableName: 'data_entry_custom_fields',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }

    const indexExists = (table?.indices || []).some((idx) => idx.name === 'IDX_data_entries_user_custom_tab_date');
    if (!indexExists) {
      await queryRunner.createIndex(
        'data_entries',
        new TableIndex({
          name: 'IDX_data_entries_user_custom_tab_date',
          columnNames: ['user_id', 'custom_tab_id', 'date'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('data_entries');
    const fk = (table?.foreignKeys || []).find((f) => f.columnNames.includes('custom_tab_id'));
    if (fk) {
      await queryRunner.dropForeignKey('data_entries', fk);
    }
    const idx = (table?.indices || []).find((i) => i.name === 'IDX_data_entries_user_custom_tab_date');
    if (idx) {
      await queryRunner.dropIndex('data_entries', idx);
    }
    const hasColumn = await queryRunner.hasColumn('data_entries', 'custom_tab_id');
    if (hasColumn) {
      await queryRunner.dropColumn('data_entries', 'custom_tab_id');
    }
  }
}

