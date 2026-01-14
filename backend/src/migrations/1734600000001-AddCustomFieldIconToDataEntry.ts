import { type MigrationInterface, type QueryRunner, TableColumn } from 'typeorm';

export class AddCustomFieldIconToDataEntry1734600000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasIcon = await queryRunner.hasColumn('data_entries', 'custom_field_icon');
    if (!hasIcon) {
      await queryRunner.addColumn(
        'data_entries',
        new TableColumn({
          name: 'custom_field_icon',
          type: 'varchar',
          length: '120',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasIcon = await queryRunner.hasColumn('data_entries', 'custom_field_icon');
    if (hasIcon) {
      await queryRunner.dropColumn('data_entries', 'custom_field_icon');
    }
  }
}
