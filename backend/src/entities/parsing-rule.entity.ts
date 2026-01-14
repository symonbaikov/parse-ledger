import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BankName } from './statement.entity';

@Entity('parsing_rules')
export class ParsingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'bank_name',
    type: 'enum',
    enum: BankName,
  })
  bankName: BankName;

  @Column({ name: 'format_version' })
  formatVersion: string;

  @Column({ name: 'column_mappings', type: 'jsonb' })
  columnMappings: Record<string, any>;

  @Column({ name: 'validation_rules', type: 'jsonb' })
  validationRules: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
