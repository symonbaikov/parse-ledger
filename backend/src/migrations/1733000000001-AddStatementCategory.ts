import { type MigrationInterface, type QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddStatementCategory1733000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('statements', 'category_id');

    if (!hasColumn) {
      await queryRunner.addColumn(
        'statements',
        new TableColumn({
          name: 'category_id',
          type: 'uuid',
          isNullable: true,
        }),
      );

      await queryRunner.createForeignKey(
        'statements',
        new TableForeignKey({
          columnNames: ['category_id'],
          referencedTableName: 'categories',
          referencedColumnNames: ['id'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('statements');
    const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('category_id'));

    if (foreignKey) {
      await queryRunner.dropForeignKey('statements', foreignKey);
    }

    const hasColumn = await queryRunner.hasColumn('statements', 'category_id');
    if (hasColumn) {
      await queryRunner.dropColumn('statements', 'category_id');
    }
  }
}
