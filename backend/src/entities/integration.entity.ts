import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DriveSettings } from '../entities/drive-settings.entity';
import { DropboxSettings } from '../entities/dropbox-settings.entity';
import { IntegrationToken } from '../entities/integration-token.entity';
import { User } from '../entities/user.entity';
import { Workspace } from '../entities/workspace.entity';

export enum IntegrationProvider {
  GOOGLE_DRIVE = 'google_drive',
  DROPBOX = 'dropbox',
}

export enum IntegrationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  NEEDS_REAUTH = 'needs_reauth',
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workspace, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace | null;

  @Column({ name: 'workspace_id', nullable: true })
  workspaceId: string | null;

  @Column({ type: 'varchar' })
  provider: IntegrationProvider;

  @Column({ type: 'varchar', default: IntegrationStatus.CONNECTED })
  status: IntegrationStatus;

  @Column({ type: 'jsonb', nullable: true })
  scopes: string[] | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'connected_by_user_id' })
  connectedByUser: User | null;

  @Column({ name: 'connected_by_user_id', nullable: true })
  connectedByUserId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(
    () => IntegrationToken,
    token => token.integration,
  )
  token: IntegrationToken | null;

  @OneToOne(
    () => DriveSettings,
    settings => settings.integration,
  )
  driveSettings: DriveSettings | null;

  @OneToOne(
    () => DropboxSettings,
    settings => settings.integration,
  )
  dropboxSettings: DropboxSettings | null;
}
