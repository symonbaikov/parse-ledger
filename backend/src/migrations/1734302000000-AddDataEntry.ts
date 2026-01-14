import { type MigrationInterface, type QueryRunner, Table, TableIndex } from 'typeorm';

export class AddDataEntry1734302000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('data_entries');
    if (!hasTable) {
      await queryRunner.createTable(
        new Table({
          name: 'data_entries',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            { name: 'user_id', type: 'uuid', isNullable: false },
            {
              name: 'type',
              type: 'enum',
              enum: ['cash', 'raw', 'debit', 'credit'],
            },
            { name: 'date', type: 'date' },
            { name: 'amount', type: 'decimal', precision: 15, scale: 2 },
            { name: 'note', type: 'text', isNullable: true },
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
        'data_entries',
        new TableIndex({
          name: 'IDX_data_entries_user_type_date',
          columnNames: ['user_id', 'type', 'date'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('data_entries');
    if (hasTable) {
      await queryRunner.dropTable('data_entries');
    }
  }
}
