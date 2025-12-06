export interface CustomReportGroup {
  key: string;
  label: string;
  totalAmount: number;
  transactionCount: number;
  transactions: Array<{
    id: string;
    date: string;
    counterparty: string;
    amount: number;
    category?: string;
    branch?: string;
    wallet?: string;
  }>;
}

export interface CustomReport {
  dateFrom: string;
  dateTo: string;
  groupBy: string;
  groups: CustomReportGroup[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    difference: number;
    transactionCount: number;
  };
}








