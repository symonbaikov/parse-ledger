import { MigrationInterface, QueryRunner } from 'typeorm';

const ACTIONS = [
  'custom_table.create',
  'custom_table.update',
  'custom_table.delete',
  'custom_table_column.create',
  'custom_table_column.update',
  'custom_table_column.delete',
  'custom_table_column.reorder',
  'custom_table_row.create',
  'custom_table_row.update',
  'custom_table_row.delete',
  'custom_table_row.batch_create',
];

export class ExtendAuditActionsForCustomTables1734400000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasAuditLogs = await queryRunner.hasTable('audit_logs');
    if (!hasAuditLogs) {
      return;
    }

    const rows: Array<{ type_name?: string; data_type?: string }> = await queryRunner.query(
      `
        SELECT udt_name AS type_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'audit_logs'
          AND column_name = 'action'
        LIMIT 1
      `,
    );

    const typeName = rows?.[0]?.type_name;
    const dataType = rows?.[0]?.data_type;
    if (!typeName || dataType !== 'USER-DEFINED') {
      return;
    }

    for (const action of ACTIONS) {
      await queryRunner.query(`ALTER TYPE "${typeName}" ADD VALUE IF NOT EXISTS '${action}'`);
    }
  }

  // Removing enum values is non-trivial; keep as no-op.
  public async down(): Promise<void> {}
}
