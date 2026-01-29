import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailAddressToGmailWatchSubscription1738056001000 implements MigrationInterface {
  name = 'AddEmailAddressToGmailWatchSubscription1738056001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add email_address column to gmail_watch_subscriptions
    await queryRunner.query(`
      ALTER TABLE "gmail_watch_subscriptions"
      ADD COLUMN "email_address" character varying NULL
    `);

    // Add index on email_address
    await queryRunner.query(`
      CREATE INDEX "IDX_gmail_watch_subscription_email"
      ON "gmail_watch_subscriptions" ("email_address")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`
      DROP INDEX "IDX_gmail_watch_subscription_email"
    `);

    // Drop email_address column
    await queryRunner.query(`
      ALTER TABLE "gmail_watch_subscriptions"
      DROP COLUMN "email_address"
    `);
  }
}
