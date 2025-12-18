import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCustomFieldToDataEntry1734600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasName = await queryRunner.hasColumn('data_entries', 'custom_field_name');
    if (!hasName) {
      await queryRunner.addColumn(
        'data_entries',
        new TableColumn({
          name: 'custom_field_name',
          type: 'varchar',
          length: '120',
          isNullable: true,
        }),
      );
    }

    const hasValue = await queryRunner.hasColumn('data_entries', 'custom_field_value');
    if (!hasValue) {
      await queryRunner.addColumn(
        'data_entries',
        new TableColumn({
          name: 'custom_field_value',
          type: 'text',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasValue = await queryRunner.hasColumn('data_entries', 'custom_field_value');
    if (hasValue) {
      await queryRunner.dropColumn('data_entries', 'custom_field_value');
    }

    const hasName = await queryRunner.hasColumn('data_entries', 'custom_field_name');
    if (hasName) {
      await queryRunner.dropColumn('data_entries', 'custom_field_name');
    }
  }
}

