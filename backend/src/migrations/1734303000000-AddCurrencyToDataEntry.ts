import { type MigrationInterface, type QueryRunner, TableColumn } from 'typeorm';

export class AddCurrencyToDataEntry1734303000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('data_entries', 'currency');
    if (!hasColumn) {
      await queryRunner.addColumn(
        'data_entries',
        new TableColumn({
          name: 'currency',
          type: 'varchar',
          length: '10',
          isNullable: false,
          default: `'KZT'`,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('data_entries', 'currency');
    if (hasColumn) {
      await queryRunner.dropColumn('data_entries', 'currency');
    }
  }
}
