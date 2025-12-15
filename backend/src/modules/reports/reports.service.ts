import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Transaction, TransactionType } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';
import { Branch } from '../../entities/branch.entity';
import { Wallet } from '../../entities/wallet.entity';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
import { DailyReport } from './interfaces/daily-report.interface';
import { MonthlyReport } from './interfaces/monthly-report.interface';
import { CustomReport, CustomReportGroup } from './interfaces/custom-report.interface';
import { CustomReportDto, ReportGroupBy } from './dto/custom-report.dto';
import { ExportReportDto, ExportFormat } from './dto/export-report.dto';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export interface StatementsSummaryResponse {
  totals: {
    income: number;
    expense: number;
    net: number;
    rows: number;
  };
  timeseries: Array<{ date: string; income: number; expense: number }>;
  categories: Array<{ name: string; amount: number; rows: number }>;
  counterparties: Array<{ name: string; amount: number; rows: number }>;
  recent: Array<{
    id: string;
    amount: number;
    category: string | null;
    counterparty: string | null;
    updatedAt: string;
  }>;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  private toDateKey(value: unknown): string {
    if (typeof value === 'string') {
      // Postgres DATE columns often come back as 'YYYY-MM-DD'
      return value.split('T')[0];
    }
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    try {
      const asDate = new Date(value as any);
      if (!Number.isNaN(asDate.getTime())) {
        return asDate.toISOString().split('T')[0];
      }
    } catch {
      // ignore
    }
    return new Date().toISOString().split('T')[0];
  }

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Generate daily report
   */
  async generateDailyReport(userId: string, date: string): Promise<DailyReport> {
    const resolvedDate = date || (await this.getLatestTransactionDate(userId));
    const reportDate = resolvedDate ? new Date(resolvedDate) : new Date();
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get income transactions
    const incomeTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.statement', 'statement')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('statement.userId = :userId', { userId })
      .andWhere('transaction.transactionType = :type', { type: TransactionType.INCOME })
      .andWhere('transaction.transactionDate >= :start', { start: startOfDay })
      .andWhere('transaction.transactionDate <= :end', { end: endOfDay })
      .getMany();

    // Get expense transactions
    const expenseTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.statement', 'statement')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('statement.userId = :userId', { userId })
      .andWhere('transaction.transactionType = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.transactionDate >= :start', { start: startOfDay })
      .andWhere('transaction.transactionDate <= :end', { end: endOfDay })
      .getMany();

    // Calculate income block
    const incomeTotal = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const counterpartyMap = new Map<string, { amount: number; count: number }>();
    incomeTransactions.forEach((t) => {
      const existing = counterpartyMap.get(t.counterpartyName) || { amount: 0, count: 0 };
      counterpartyMap.set(t.counterpartyName, {
        amount: existing.amount + (t.amount || 0),
        count: existing.count + 1,
      });
    });

    const topCounterparties = Array.from(counterpartyMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Calculate expense block
    const expenseTotal = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const categoryMap = new Map<string, { name: string; amount: number; count: number }>();
    expenseTransactions.forEach((t) => {
      const categoryId = t.categoryId || 'uncategorized';
      const categoryName = t.category?.name || 'Без категории';
      const existing = categoryMap.get(categoryId) || { name: categoryName, amount: 0, count: 0 };
      categoryMap.set(categoryId, {
        name: categoryName,
        amount: existing.amount + (t.amount || 0),
        count: existing.count + 1,
      });
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    const report: DailyReport = {
      date: date,
      income: {
        totalAmount: incomeTotal,
        transactionCount: incomeTransactions.length,
        topCounterparties,
      },
      expense: {
        totalAmount: expenseTotal,
        transactionCount: expenseTransactions.length,
        topCategories,
      },
      summary: {
        incomeTotal,
        expenseTotal,
        difference: incomeTotal - expenseTotal,
      },
    };

    // Log to audit
    await this.logReportGeneration(userId, 'daily', date);

    return report;
  }

  /**
   * Generate monthly report
   */
  async generateMonthlyReport(userId: string, year: number, month: number): Promise<MonthlyReport> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all transactions for the month
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.statement', 'statement')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.branch', 'branch')
      .leftJoinAndSelect('transaction.wallet', 'wallet')
      .where('statement.userId = :userId', { userId })
      .andWhere('transaction.transactionDate >= :start', { start: startDate })
      .andWhere('transaction.transactionDate <= :end', { end: endDate })
      .getMany();

    // Calculate daily trends
    const dailyMap = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
      const dateKey = t.transactionDate.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { income: 0, expense: 0 };
      if (t.transactionType === TransactionType.INCOME) {
        existing.income += t.amount || 0;
      } else {
        existing.expense += t.amount || 0;
      }
      dailyMap.set(dateKey, existing);
    });

    const dailyTrends = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate category distribution
    const categoryMap = new Map<string, { name: string; amount: number; count: number }>();
    transactions
      .filter((t) => t.transactionType === TransactionType.EXPENSE)
      .forEach((t) => {
        const categoryId = t.categoryId || 'uncategorized';
        const categoryName = t.category?.name || 'Без категории';
        const existing = categoryMap.get(categoryId) || { name: categoryName, amount: 0, count: 0 };
        categoryMap.set(categoryId, {
          name: categoryName,
          amount: existing.amount + (t.amount || 0),
          count: existing.count + 1,
        });
      });

    const totalExpense = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.amount, 0);
    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        amount: data.amount,
        percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate counterparty distribution
    const counterpartyMap = new Map<string, { amount: number; count: number }>();
    transactions.forEach((t) => {
      const existing = counterpartyMap.get(t.counterpartyName) || { amount: 0, count: 0 };
      counterpartyMap.set(t.counterpartyName, {
        amount: existing.amount + (t.amount || 0),
        count: existing.count + 1,
      });
    });

    const totalAmount = Array.from(counterpartyMap.values()).reduce((sum, c) => sum + c.amount, 0);
    const counterpartyDistribution = Array.from(counterpartyMap.entries())
      .map(([counterpartyName, data]) => ({
        counterpartyName,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 20);

    // Calculate comparison with previous period
    const previousStartDate = new Date(year, month - 2, 1);
    const previousEndDate = new Date(year, month - 1, 0, 23, 59, 59, 999);

    const previousTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.statement', 'statement')
      .where('statement.userId = :userId', { userId })
      .andWhere('transaction.transactionDate >= :start', { start: previousStartDate })
      .andWhere('transaction.transactionDate <= :end', { end: previousEndDate })
      .getMany();

    const currentIncome = transactions
      .filter((t) => t.transactionType === TransactionType.INCOME)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const currentExpense = transactions
      .filter((t) => t.transactionType === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const currentDifference = currentIncome - currentExpense;

    const previousIncome = previousTransactions
      .filter((t) => t.transactionType === TransactionType.INCOME)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const previousExpense = previousTransactions
      .filter((t) => t.transactionType === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const previousDifference = previousIncome - previousExpense;

    const incomeChange = currentIncome - previousIncome;
    const expenseChange = currentExpense - previousExpense;
    const differenceChange = currentDifference - previousDifference;

    const report: MonthlyReport = {
      month: month.toString(),
      year,
      dailyTrends,
      categoryDistribution,
      counterpartyDistribution,
      comparison: {
        currentPeriod: {
          income: currentIncome,
          expense: currentExpense,
          difference: currentDifference,
        },
        previousPeriod: {
          income: previousIncome,
          expense: previousExpense,
          difference: previousDifference,
        },
        change: {
          incomeChange,
          expenseChange,
          differenceChange,
          incomeChangePercent: previousIncome > 0 ? (incomeChange / previousIncome) * 100 : 0,
          expenseChangePercent: previousExpense > 0 ? (expenseChange / previousExpense) * 100 : 0,
          differenceChangePercent: previousDifference !== 0 ? (differenceChange / Math.abs(previousDifference)) * 100 : 0,
        },
      },
      summary: {
        totalIncome: currentIncome,
        totalExpense: currentExpense,
        difference: currentDifference,
        transactionCount: transactions.length,
      },
    };

    // Log to audit
    await this.logReportGeneration(userId, 'monthly', `${year}-${month.toString().padStart(2, '0')}`);

    return report;
  }

  /**
   * Returns latest transaction date for user (YYYY-MM-DD) and month/year pair
   */
  async getLatestTransactionPeriod(
    userId: string,
  ): Promise<{ date: string | null; year: number | null; month: number | null }> {
    const latest = await this.getLatestTransactionDate(userId);
    if (!latest) {
      return { date: null, year: null, month: null };
    }
    const dt = new Date(latest);
    return {
      date: latest,
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
    };
  }

  /**
   * Latest transaction date in ISO (YYYY-MM-DD) or null
   */
  async getLatestTransactionDate(userId: string): Promise<string | null> {
    const latest = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.statement', 'statement')
      .where('statement.userId = :userId', { userId })
      .orderBy('transaction.transactionDate', 'DESC')
      .select('transaction.transactionDate', 'transactionDate')
      .getRawOne<{ transactionDate: Date }>();

    if (!latest?.transactionDate) {
      return null;
    }
    return latest.transactionDate.toISOString().split('T')[0];
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(userId: string, dto: CustomReportDto): Promise<CustomReport> {
    const dateFrom = new Date(dto.dateFrom);
    const dateTo = new Date(dto.dateTo);

    // Build query
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.statement', 'statement')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.branch', 'branch')
      .leftJoinAndSelect('transaction.wallet', 'wallet')
      .where('statement.userId = :userId', { userId })
      .andWhere('transaction.transactionDate >= :dateFrom', { dateFrom })
      .andWhere('transaction.transactionDate <= :dateTo', { dateTo });

    // Apply filters
    if (dto.categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', { categoryId: dto.categoryId });
    }
    if (dto.branchId) {
      queryBuilder.andWhere('transaction.branchId = :branchId', { branchId: dto.branchId });
    }
    if (dto.walletId) {
      queryBuilder.andWhere('transaction.walletId = :walletId', { walletId: dto.walletId });
    }

    const transactions = await queryBuilder.getMany();

    // Group transactions
    const groupMap = new Map<string, CustomReportGroup>();
    const groupBy = dto.groupBy || ReportGroupBy.DAY;

    transactions.forEach((t) => {
      let key: string;
      let label: string;

      switch (groupBy) {
        case ReportGroupBy.CATEGORY:
          key = t.categoryId || 'uncategorized';
          label = t.category?.name || 'Без категории';
          break;
        case ReportGroupBy.COUNTERPARTY:
          key = t.counterpartyName;
          label = t.counterpartyName;
          break;
        case ReportGroupBy.BRANCH:
          key = t.branchId || 'unassigned';
          label = t.branch?.name || 'Не назначен';
          break;
        case ReportGroupBy.WALLET:
          key = t.walletId || 'unassigned';
          label = t.wallet?.name || 'Не назначен';
          break;
        case ReportGroupBy.DAY:
          key = t.transactionDate.toISOString().split('T')[0];
          label = t.transactionDate.toLocaleDateString('ru-RU');
          break;
        case ReportGroupBy.MONTH:
          const month = t.transactionDate.getMonth() + 1;
          const year = t.transactionDate.getFullYear();
          key = `${year}-${month.toString().padStart(2, '0')}`;
          label = `${month.toString().padStart(2, '0')}.${year}`;
          break;
        default:
          key = 'all';
          label = 'Все';
      }

      const existing = groupMap.get(key) || {
        key,
        label,
        totalAmount: 0,
        transactionCount: 0,
        transactions: [],
      };

      existing.totalAmount += t.amount || 0;
      existing.transactionCount += 1;
      existing.transactions.push({
        id: t.id,
        date: t.transactionDate.toISOString().split('T')[0],
        counterparty: t.counterpartyName,
        amount: t.amount || 0,
        category: t.category?.name,
        branch: t.branch?.name,
        wallet: t.wallet?.name,
      });

      groupMap.set(key, existing);
    });

    const groups = Array.from(groupMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);

    const totalIncome = transactions
      .filter((t) => t.transactionType === TransactionType.INCOME)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpense = transactions
      .filter((t) => t.transactionType === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const report: CustomReport = {
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      groupBy,
      groups,
      summary: {
        totalIncome,
        totalExpense,
        difference: totalIncome - totalExpense,
        transactionCount: transactions.length,
      },
    };

    // Log to audit
    await this.logReportGeneration(userId, 'custom', `${dto.dateFrom}_${dto.dateTo}`);

    return report;
  }

  /**
   * Export report to Excel or CSV
   */
  async exportReport(
    userId: string,
    dto: ExportReportDto,
    reportData: DailyReport | MonthlyReport | CustomReport,
  ): Promise<{ filePath: string; fileName: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `report-${timestamp}.${dto.format === ExportFormat.EXCEL ? 'xlsx' : 'csv'}`;
    const uploadsBaseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsBaseDir, 'reports', fileName);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (dto.format === ExportFormat.EXCEL) {
      await this.exportToExcel(reportData, filePath);
    } else {
      await this.exportToCSV(reportData, filePath);
    }

    return { filePath, fileName };
  }

  private async exportToExcel(
    reportData: DailyReport | MonthlyReport | CustomReport,
    filePath: string,
  ): Promise<void> {
    const workbook = XLSX.utils.book_new();

    if ('date' in reportData) {
      // Daily report
      const dailyData = reportData as DailyReport;
      const ws = XLSX.utils.json_to_sheet([
        { Тип: 'Приходы', Сумма: dailyData.income.totalAmount, Количество: dailyData.income.transactionCount },
        { Тип: 'Расходы', Сумма: dailyData.expense.totalAmount, Количество: dailyData.expense.transactionCount },
        { Тип: 'Разница', Сумма: dailyData.summary.difference },
      ]);
      XLSX.utils.book_append_sheet(workbook, ws, 'Отчёт');
    } else if ('month' in reportData) {
      // Monthly report
      const monthlyData = reportData as MonthlyReport;
      const ws = XLSX.utils.json_to_sheet(monthlyData.dailyTrends);
      XLSX.utils.book_append_sheet(workbook, ws, 'Динамика');
    } else {
      // Custom report
      const customData = reportData as CustomReport;
      const rows: any[] = [];
      customData.groups.forEach((group) => {
        group.transactions.forEach((t) => {
          rows.push({
            Группа: group.label,
            Дата: t.date,
            Контрагент: t.counterparty,
            Сумма: t.amount,
            Категория: t.category || '',
            Филиал: t.branch || '',
            Кошелёк: t.wallet || '',
          });
        });
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, ws, 'Отчёт');
    }

    XLSX.writeFile(workbook, filePath);
  }

  private async exportToCSV(
    reportData: DailyReport | MonthlyReport | CustomReport,
    filePath: string,
  ): Promise<void> {
    let csvContent = '';

    if ('date' in reportData) {
      // Daily report
      const dailyData = reportData as DailyReport;
      csvContent = 'Тип,Сумма,Количество\n';
      csvContent += `Приходы,${dailyData.income.totalAmount},${dailyData.income.transactionCount}\n`;
      csvContent += `Расходы,${dailyData.expense.totalAmount},${dailyData.expense.transactionCount}\n`;
      csvContent += `Разница,${dailyData.summary.difference},\n`;
    } else if ('month' in reportData) {
      // Monthly report
      const monthlyData = reportData as MonthlyReport;
      csvContent = 'Дата,Приходы,Расходы\n';
      monthlyData.dailyTrends.forEach((trend) => {
        csvContent += `${trend.date},${trend.income},${trend.expense}\n`;
      });
    } else {
      // Custom report
      const customData = reportData as CustomReport;
      csvContent = 'Группа,Дата,Контрагент,Сумма,Категория,Филиал,Кошелёк\n';
      customData.groups.forEach((group) => {
        group.transactions.forEach((t) => {
          csvContent += `${group.label},${t.date},${t.counterparty},${t.amount},${t.category || ''},${t.branch || ''},${t.wallet || ''}\n`;
        });
      });
    }

    fs.writeFileSync(filePath, csvContent, 'utf-8');
  }

  /**
   * Log report generation to audit log
   */
  private async logReportGeneration(userId: string, reportType: string, reportDate: string): Promise<void> {
    await this.auditLogRepository.save({
      userId,
      action: AuditAction.REPORT_GENERATE,
      description: `Generated ${reportType} report for ${reportDate}`,
      metadata: {
        reportType,
        reportDate,
      },
    });
  }

  async getStatementsSummary(userId: string, days: number = 30): Promise<StatementsSummaryResponse> {
    const safeDays = Number.isFinite(days) && days > 0 ? Math.min(days, 3650) : 30;
    const since = new Date();
    since.setDate(since.getDate() - safeDays);
    since.setHours(0, 0, 0, 0);

    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.statement', 'statement')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('statement.userId = :userId', { userId })
      .andWhere('transaction.transactionDate >= :since', { since })
      .orderBy('transaction.updatedAt', 'DESC')
      .take(2000)
      .getMany();

    const totals = { income: 0, expense: 0, net: 0, rows: transactions.length };
    const timeseriesMap = new Map<string, { income: number; expense: number }>();
    const categoryMap = new Map<string, { amount: number; rows: number }>();
    const counterpartyMap = new Map<string, { amount: number; rows: number }>();

    const recent = transactions
      .slice(0, 50)
      .map((t) => {
        const amount = Number(t.amount || 0);
        const abs = Math.abs(amount);
        const signedAmount = t.transactionType === TransactionType.INCOME ? abs : -abs;
        return {
          id: t.id,
          amount: signedAmount,
          category: t.category?.name || null,
          counterparty: t.counterpartyName || null,
          updatedAt: (t.updatedAt || t.createdAt).toISOString(),
        };
      })
      .slice(0, 20);

    transactions.forEach((t) => {
      const amount = Number(t.amount || 0);
      const abs = Math.abs(amount);
      const dateKey = this.toDateKey(t.transactionDate as any);
      const ts = timeseriesMap.get(dateKey) || { income: 0, expense: 0 };

      if (t.transactionType === TransactionType.INCOME) {
        ts.income += abs;
        const counterparty = (t.counterpartyName || 'Без названия').trim() || 'Без названия';
        const existing = counterpartyMap.get(counterparty) || { amount: 0, rows: 0 };
        counterpartyMap.set(counterparty, { amount: existing.amount + abs, rows: existing.rows + 1 });
        totals.income += abs;
      } else {
        ts.expense += abs;
        const category = (t.category?.name || 'Без категории').trim() || 'Без категории';
        const existing = categoryMap.get(category) || { amount: 0, rows: 0 };
        categoryMap.set(category, { amount: existing.amount + abs, rows: existing.rows + 1 });
        totals.expense += abs;
      }

      timeseriesMap.set(dateKey, ts);
    });

    totals.net = totals.income - totals.expense;

    const timeseries = Array.from(timeseriesMap.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const categories = Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, amount: data.amount, rows: data.rows }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    const counterparties = Array.from(counterpartyMap.entries())
      .map(([name, data]) => ({ name, amount: data.amount, rows: data.rows }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    return { totals, timeseries, categories, counterparties, recent };
  }
}
