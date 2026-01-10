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
import { GoogleSheet } from './google-sheet.entity';
import { Transaction } from './transaction.entity';
import { Category } from './category.entity';

export enum StatementStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PARSED = 'parsed',
  VALIDATED = 'validated',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum BankName {
  BEREKE_NEW = 'bereke_new',
  BEREKE_OLD = 'bereke_old',
  KASPI = 'kaspi',
  OTHER = 'other',
}

export enum FileType {
  PDF = 'pdf',
  XLSX = 'xlsx',
  CSV = 'csv',
  IMAGE = 'image',
}

@Entity('statements')
export class Statement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.statements)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => GoogleSheet, (sheet) => sheet.statements, { nullable: true })
  @JoinColumn({ name: 'google_sheet_id' })
  googleSheet: GoogleSheet | null;

  @Column({ name: 'google_sheet_id', nullable: true })
  googleSheetId: string | null;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({
    name: 'file_type',
    type: 'enum',
    enum: FileType,
  })
  fileType: FileType;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'file_hash' })
  fileHash: string;

  @Column({
    name: 'bank_name',
    type: 'enum',
    enum: BankName,
  })
  bankName: BankName;

  @Column({ name: 'account_number', nullable: true })
  accountNumber: string | null;

  @Column({ name: 'statement_date_from', type: 'date', nullable: true })
  statementDateFrom: Date | null;

  @Column({ name: 'statement_date_to', type: 'date', nullable: true })
  statementDateTo: Date | null;

  @Column({
    type: 'enum',
    enum: StatementStatus,
    default: StatementStatus.UPLOADED,
  })
  status: StatementStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'total_transactions', default: 0 })
  totalTransactions: number;

  @Column({ name: 'total_debit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDebit: number;

  @Column({ name: 'total_credit', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCredit: number;

  @Column({ name: 'balance_start', type: 'decimal', precision: 15, scale: 2, nullable: true })
  balanceStart: number | null;

  @Column({ name: 'balance_end', type: 'decimal', precision: 15, scale: 2, nullable: true })
  balanceEnd: number | null;

  @Column({ default: 'KZT' })
  currency: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'processed_at', nullable: true })
  processedAt: Date | null;

  @Column({ name: 'parsing_details', type: 'jsonb', nullable: true })
  parsingDetails: {
    detectedBank?: string;
    detectedFormat?: string;
    parserUsed?: string;
    totalLinesProcessed?: number;
    transactionsFound?: number;
    transactionsCreated?: number;
    errors?: string[];
    warnings?: string[];
    metadataExtracted?: {
      accountNumber?: string;
      dateFrom?: string;
      dateTo?: string;
      balanceStart?: number;
      balanceEnd?: number;
      currency?: string;
    };
    processingTime?: number; // milliseconds
    logEntries?: Array<{ timestamp: string; level: string; message: string }>;
  } | null;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.statement)
  transactions: Transaction[];
}
