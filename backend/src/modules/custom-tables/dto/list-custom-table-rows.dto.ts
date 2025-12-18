export type CustomTableRowFilterOp =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'startsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'isEmpty'
  | 'isNotEmpty';

export interface CustomTableRowFilterDto {
  col: string;
  op: CustomTableRowFilterOp;
  value?: unknown;
}

