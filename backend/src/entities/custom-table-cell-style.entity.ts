import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('custom_table_cell_styles')
@Index('IDX_custom_table_cell_styles_table_id', ['tableId'])
@Index('IDX_custom_table_cell_styles_table_row_col_unique', ['tableId', 'rowNumber', 'columnKey'], { unique: true })
export class CustomTableCellStyle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'table_id', type: 'uuid' })
  tableId: string;

  @Column({ name: 'row_number', type: 'int' })
  rowNumber: number;

  @Column({ name: 'column_key', type: 'varchar' })
  columnKey: string;

  @Column({ name: 'style', type: 'jsonb', default: () => "'{}'::jsonb" })
  style: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

