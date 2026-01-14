export interface ClassificationRule {
  id?: string;
  name: string;
  type: 'category' | 'branch' | 'wallet' | 'article' | 'activity_type';
  conditions: ClassificationCondition[];
  result: ClassificationResult;
  priority: number;
  isActive: boolean;
}

export interface ClassificationCondition {
  field:
    | 'counterparty_name'
    | 'payment_purpose'
    | 'amount'
    | 'counterparty_bin'
    | 'document_number';
  operator:
    | 'contains'
    | 'equals'
    | 'starts_with'
    | 'ends_with'
    | 'regex'
    | 'greater_than'
    | 'less_than';
  value: string | number;
}

export interface ClassificationResult {
  categoryId?: string;
  branchId?: string;
  walletId?: string;
  article?: string;
  activityType?: string;
}
