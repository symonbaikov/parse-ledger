import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  STATEMENT_UPLOAD = 'statement.upload',
  STATEMENT_DELETE = 'statement.delete',
  TRANSACTION_UPDATE = 'transaction.update',
  CATEGORY_CREATE = 'category.create',
  CATEGORY_UPDATE = 'category.update',
  CATEGORY_DELETE = 'category.delete',
  BRANCH_CREATE = 'branch.create',
  BRANCH_UPDATE = 'branch.update',
  BRANCH_DELETE = 'branch.delete',
  WALLET_CREATE = 'wallet.create',
  WALLET_UPDATE = 'wallet.update',
  WALLET_DELETE = 'wallet.delete',
  REPORT_GENERATE = 'report.generate',
  CUSTOM_TABLE_CREATE = 'custom_table.create',
  CUSTOM_TABLE_UPDATE = 'custom_table.update',
  CUSTOM_TABLE_DELETE = 'custom_table.delete',
  CUSTOM_TABLE_COLUMN_CREATE = 'custom_table_column.create',
  CUSTOM_TABLE_COLUMN_UPDATE = 'custom_table_column.update',
  CUSTOM_TABLE_COLUMN_DELETE = 'custom_table_column.delete',
  CUSTOM_TABLE_COLUMN_REORDER = 'custom_table_column.reorder',
  CUSTOM_TABLE_ROW_CREATE = 'custom_table_row.create',
  CUSTOM_TABLE_ROW_UPDATE = 'custom_table_row.update',
  CUSTOM_TABLE_ROW_DELETE = 'custom_table_row.delete',
  CUSTOM_TABLE_ROW_BATCH_CREATE = 'custom_table_row.batch_create',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}







