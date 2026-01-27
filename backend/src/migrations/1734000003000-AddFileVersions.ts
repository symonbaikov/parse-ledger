import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddFileVersions1734000003000 implements MigrationInterface {
  name = 'AddFileVersions1734000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'file_versions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'statement_id', type: 'uuid' },
          { name: 'created_by', type: 'uuid' },
          { name: 'file_hash', type: 'varchar' },
          { name: 'file_name', type: 'varchar' },
          { name: 'file_type', type: 'varchar' },
          { name: 'file_size', type: 'bigint' },
          { name: 'file_data', type: 'bytea' },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'file_versions',
      new TableForeignKey({
        columnNames: ['statement_id'],
        referencedTableName: 'statements',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'file_versions',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('file_versions', true);
  }
}
