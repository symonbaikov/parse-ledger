import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceBackgroundCurrencyFavorite1738164000000 implements MigrationInterface {
  name = 'AddWorkspaceBackgroundCurrencyFavorite1738164000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD "background_image" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "workspaces" ADD "currency" character varying(10)`);
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD "is_favorite" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "is_favorite"`);
    await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "currency"`);
    await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "background_image"`);
  }
}
