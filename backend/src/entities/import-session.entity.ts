import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Statement } from './statement.entity';
import { User } from './user.entity';
import { Workspace } from './workspace.entity';

export enum ImportSessionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PREVIEW = 'preview',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ImportSessionMode {
  PREVIEW = 'preview',
  COMMIT = 'commit',
}

export interface ImportSessionMetadata {
  totalTransactions: number;
  newCount: number;
  matchedCount: number;
  skippedCount: number;
  conflictedCount: number;
  failedCount: number;
  conflicts: Array<{
    transactionIndex: number;
    reason: string;
    confidence: number;
  }>;
  warnings: string[];
  errors: string[];
}

@Entity('import_sessions')
export class ImportSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workspace, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @ManyToOne(() => Statement, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'statement_id' })
  statement: Statement | null;

  @Column({ name: 'statement_id', nullable: true })
  statementId: string | null;

  @Column({
    type: 'enum',
    enum: ImportSessionStatus,
    default: ImportSessionStatus.PENDING,
  })
  status: ImportSessionStatus;

  @Column({
    type: 'enum',
    enum: ImportSessionMode,
  })
  mode: ImportSessionMode;

  @Column({ name: 'file_hash' })
  fileHash: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'session_metadata', type: 'jsonb', nullable: true })
  sessionMetadata: ImportSessionMetadata | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;
}
