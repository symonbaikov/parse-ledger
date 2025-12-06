import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Statement } from './statement.entity';
import { GoogleSheet } from './google-sheet.entity';
import { TelegramReport } from './telegram-report.entity';
import { Category } from './category.entity';
import { Branch } from './branch.entity';
import { Wallet } from './wallet.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  company: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'google_id', nullable: true })
  googleId: string | null;

  @Column({ name: 'telegram_id', nullable: true })
  telegramId: string | null;

  @Column({ name: 'telegram_chat_id', nullable: true })
  telegramChatId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: null,
  })
  permissions: string[] | null;

  // Relations
  @OneToMany(() => Statement, (statement) => statement.user)
  statements: Statement[];

  @OneToMany(() => GoogleSheet, (sheet) => sheet.user)
  googleSheets: GoogleSheet[];

  @OneToMany(() => TelegramReport, (report) => report.user)
  telegramReports: TelegramReport[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Branch, (branch) => branch.user)
  branches: Branch[];

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];
}

