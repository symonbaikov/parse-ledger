import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { DataEntryCustomField } from './data-entry-custom-field.entity';

export enum DataEntryType {
  CASH = 'cash',
  RAW = 'raw',
  DEBIT = 'debit',
  CREDIT = 'credit',
}

@Entity('data_entries')
@Index('IDX_data_entries_user_type_date', ['userId', 'type', 'date'])
@Index('IDX_data_entries_user_custom_tab_date', ['userId', 'customTabId', 'date'])
export class DataEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: DataEntryType,
  })
  type: DataEntryType;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'varchar', length: 10, default: 'KZT' })
  currency: string;

  @Column({ name: 'custom_field_name', type: 'varchar', length: 120, nullable: true })
  customFieldName: string | null;

  @Column({ name: 'custom_field_icon', type: 'varchar', length: 120, nullable: true })
  customFieldIcon: string | null;

  @Column({ name: 'custom_field_value', type: 'text', nullable: true })
  customFieldValue: string | null;

  @ManyToOne(() => DataEntryCustomField, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'custom_tab_id' })
  customTab: DataEntryCustomField | null;

  @Column({ name: 'custom_tab_id', type: 'uuid', nullable: true })
  customTabId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
