import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Statement } from './statement.entity';
import { GoogleSheetRow } from './google-sheet-row.entity';

@Entity('google_sheets')
export class GoogleSheet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.googleSheets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'sheet_id' })
  sheetId: string;

  @Column({ name: 'sheet_name' })
  sheetName: string;

  @Column({ name: 'worksheet_name', nullable: true })
  worksheetName: string | null;

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_sync', nullable: true })
  lastSync: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Statement, (statement) => statement.googleSheet)
  statements: Statement[];

  @OneToMany(() => GoogleSheetRow, (row) => row.googleSheet)
  rows: GoogleSheetRow[];
}







