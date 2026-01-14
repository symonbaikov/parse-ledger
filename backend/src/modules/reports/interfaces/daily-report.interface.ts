export interface DailyIncomeBlock {
  totalAmount: number;
  transactionCount: number;
  topCounterparties: Array<{
    name: string;
    amount: number;
    count: number;
  }>;
}

export interface DailyExpenseBlock {
  totalAmount: number;
  transactionCount: number;
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
  }>;
}

export interface DailySummaryBlock {
  incomeTotal: number;
  expenseTotal: number;
  difference: number;
  balance?: number;
}

export interface DailyReport {
  date: string;
  income: DailyIncomeBlock;
  expense: DailyExpenseBlock;
  summary: DailySummaryBlock;
}
