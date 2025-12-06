import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddTelegramEntities1733683200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Extend users table with telegram columns if they don't exist yet
    const usersTable = await queryRunner.getTable('users');

    if (usersTable && !usersTable.findColumnByName('telegram_id')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'telegram_id',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (usersTable && !usersTable.findColumnByName('telegram_chat_id')) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'telegram_chat_id',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    const hasTelegramReports = await queryRunner.hasTable('telegram_reports');
    let telegramReportsTable = await queryRunner.getTable('telegram_reports');

    if (!hasTelegramReports) {
      await queryRunner.createTable(
        new Table({
          name: 'telegram_reports',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'user_id',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'chat_id',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'report_type',
              type: 'enum',
              enum: ['daily', 'monthly', 'custom'],
            },
            {
              name: 'report_date',
              type: 'date',
            },
            {
              name: 'sent_at',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'enum',
              enum: ['pending', 'sent', 'failed'],
              default: "'pending'",
            },
            {
              name: 'message_id',
              type: 'varchar',
              isNullable: true,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
        true,
      );

      await queryRunner.createForeignKey(
        'telegram_reports',
        new TableForeignKey({
          columnNames: ['user_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        }),
      );

      telegramReportsTable = await queryRunner.getTable('telegram_reports');
    }

    if (telegramReportsTable) {
      const hasUserIndex = telegramReportsTable.indices.some(
        (index) => index.name === 'IDX_telegram_reports_user',
      );
      if (!hasUserIndex) {
        await queryRunner.createIndex(
          'telegram_reports',
          new TableIndex({
            name: 'IDX_telegram_reports_user',
            columnNames: ['user_id'],
          }),
        );
      }

      const hasTypeDateIndex = telegramReportsTable.indices.some(
        (index) => index.name === 'IDX_telegram_reports_type_date',
      );
      if (!hasTypeDateIndex) {
        await queryRunner.createIndex(
          'telegram_reports',
          new TableIndex({
            name: 'IDX_telegram_reports_type_date',
            columnNames: ['report_type', 'report_date'],
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTelegramReports = await queryRunner.hasTable('telegram_reports');
    if (hasTelegramReports) {
      await queryRunner.dropTable('telegram_reports');
    }

    const usersTable = await queryRunner.getTable('users');
    if (usersTable && usersTable.findColumnByName('telegram_chat_id')) {
      await queryRunner.dropColumn('users', 'telegram_chat_id');
    }

    if (usersTable && usersTable.findColumnByName('telegram_id')) {
      await queryRunner.dropColumn('users', 'telegram_id');
    }
  }
}
