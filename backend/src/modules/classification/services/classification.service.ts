import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../../../entities/transaction.entity';
import { Category, CategoryType } from '../../../entities/category.entity';
import { Branch } from '../../../entities/branch.entity';
import { Wallet } from '../../../entities/wallet.entity';
import {
  ClassificationRule,
  ClassificationCondition,
  ClassificationResult,
} from '../interfaces/classification-rule.interface';

@Injectable()
export class ClassificationService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async classifyTransaction(transaction: Transaction, userId: string): Promise<Partial<Transaction>> {
    const classification: Partial<Transaction> = {};

    // Determine transaction type (income/expense)
    if (transaction.debit && transaction.debit > 0) {
      classification.transactionType = TransactionType.EXPENSE;
    } else if (transaction.credit && transaction.credit > 0) {
      classification.transactionType = TransactionType.INCOME;
    }

    // Get classification rules for user
    const rules = await this.getClassificationRules(userId);

    // Apply rules in priority order
    for (const rule of rules.sort((a, b) => b.priority - a.priority)) {
      if (this.matchesRule(transaction, rule.conditions)) {
        // Apply rule result
        if (rule.result.categoryId) {
          classification.categoryId = rule.result.categoryId;
        }
        if (rule.result.branchId) {
          classification.branchId = rule.result.branchId;
        }
        if (rule.result.walletId) {
          classification.walletId = rule.result.walletId;
        }
        if (rule.result.article) {
          classification.article = rule.result.article;
        }
        if (rule.result.activityType) {
          classification.activityType = rule.result.activityType;
        }

        // Stop at first matching rule (highest priority)
        break;
      }
    }

    // Auto-classify category if not set
    if (!classification.categoryId) {
      classification.categoryId = await this.autoClassifyCategory(
        transaction,
        userId,
        classification.transactionType || TransactionType.EXPENSE,
      );
    }

    // Auto-determine wallet if not set
    if (!classification.walletId) {
      classification.walletId = await this.autoDetermineWallet(transaction, userId);
    }

    // Auto-determine branch if not set
    if (!classification.branchId) {
      classification.branchId = await this.autoDetermineBranch(transaction, userId);
    }

    return classification;
  }

  private matchesRule(transaction: Transaction, conditions: ClassificationCondition[]): boolean {
    return conditions.every((condition) => {
      const fieldValue = this.getFieldValue(transaction, condition.field);
      return this.evaluateCondition(fieldValue, condition);
    });
  }

  private getFieldValue(transaction: Transaction, field: string): string | number | null {
    switch (field) {
      case 'counterparty_name':
        return transaction.counterpartyName;
      case 'payment_purpose':
        return transaction.paymentPurpose;
      case 'amount':
        return transaction.amount || transaction.debit || transaction.credit || 0;
      case 'counterparty_bin':
        return transaction.counterpartyBin || null;
      case 'document_number':
        return transaction.documentNumber || null;
      default:
        return null;
    }
  }

  private evaluateCondition(
    fieldValue: string | number | null,
    condition: ClassificationCondition,
  ): boolean {
    if (fieldValue === null || fieldValue === undefined) {
      return false;
    }

    const conditionValue = condition.value;
    const fieldStr = String(fieldValue).toLowerCase();
    const conditionStr = String(conditionValue).toLowerCase();

    switch (condition.operator) {
      case 'contains':
        return fieldStr.includes(conditionStr);
      case 'equals':
        return fieldStr === conditionStr;
      case 'starts_with':
        return fieldStr.startsWith(conditionStr);
      case 'ends_with':
        return fieldStr.endsWith(conditionStr);
      case 'regex':
        try {
          const regex = new RegExp(conditionValue as string, 'i');
          return regex.test(fieldStr);
        } catch {
          return false;
        }
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      default:
        return false;
    }
  }

  private async autoClassifyCategory(
    transaction: Transaction,
    userId: string,
    transactionType: TransactionType,
  ): Promise<string | undefined> {
    // Look for common patterns in counterparty name or purpose
    const searchText = `${transaction.counterpartyName} ${transaction.paymentPurpose}`.toLowerCase();

    // Common patterns for Kaspi and other banks
    const patterns: Array<{ pattern: RegExp; categoryName: string }> = [
      // Kaspi specific
      { pattern: /kaspi red/i, categoryName: 'Платежи Kaspi Red' },
      { pattern: /продажи\s+с\s+kaspi/i, categoryName: 'Продажи Kaspi' },
      { pattern: /бонусы?\s+за\s+отзыв/i, categoryName: 'Маркетинг и реклама' },
      { pattern: /kaspi\s+доставка|доставк.*kaspi/i, categoryName: 'Логистика и доставка' },
      { pattern: /рекламн.*услуг|услуг.*рекламн/i, categoryName: 'Маркетинг и реклама' },
      { pattern: /информационно.*технолог|IT.*услуг/i, categoryName: 'IT услуги' },
      { pattern: /комисси.*kaspi|kaspi.*комисси/i, categoryName: 'Комиссии банка' },
      { pattern: /перевод\s+собственных\s+средств/i, categoryName: 'Внутренние переводы' },
      { pattern: /резервирование.*кредит|погашение.*кредит/i, categoryName: 'Кредиты и займы' },
      { pattern: /kaspi\s+gold|gold.*карт/i, categoryName: 'Комиссии банка' },
      { pattern: /kaspi\s+магазин/i, categoryName: 'Комиссии Kaspi' },
      { pattern: /kaspi\s*pay/i, categoryName: 'Комиссии Kaspi' },
      // General patterns
      { pattern: /зарплат/i, categoryName: 'Зарплаты сотрудникам' },
      { pattern: /аренд/i, categoryName: 'Аренда' },
      { pattern: /коммунал/i, categoryName: 'Коммунальные услуги' },
      { pattern: /налог/i, categoryName: 'Налоги' },
      { pattern: /поступлени|приход/i, categoryName: 'Приход' },
      { pattern: /оплата\s+услуг/i, categoryName: 'Оплата услуг' },
      { pattern: /закуп|товар/i, categoryName: 'Закупки товаров' },
      { pattern: /страхов/i, categoryName: 'Страхование' },
      { pattern: /доставк|курьер/i, categoryName: 'Логистика и доставка' },
      { pattern: /маркетинг|реклам/i, categoryName: 'Маркетинг и реклама' },
      { pattern: /комисси/i, categoryName: 'Комиссии банка' },
      { pattern: /кредит|лизинг|займ/i, categoryName: 'Кредиты и займы' },
    ];

    for (const { pattern, categoryName } of patterns) {
      if (pattern.test(searchText)) {
        const categoryId = await this.ensureCategory(
          userId,
          categoryName,
          transactionType === TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE,
        );

        if (categoryId) {
          return categoryId;
        }
      }
    }

    // Try to find category by historical data
    const historicalCategory = await this.findCategoryByHistory(transaction, userId);
    if (historicalCategory) {
      return historicalCategory.id;
    }

    return undefined;
  }

  private async findCategoryByHistory(
    transaction: Transaction,
    userId: string,
  ): Promise<Category | null> {
    // Find most common category for this counterparty
    // Note: transactions don't have userId, they're linked via statement->user
    const result = await this.categoryRepository
      .createQueryBuilder('category')
      .innerJoin('category.transactions', 'transaction')
      .innerJoin('transaction.statement', 'statement')
      .where('transaction.counterpartyName = :counterpartyName', {
        counterpartyName: transaction.counterpartyName,
      })
      .andWhere('statement.userId = :userId', { userId })
      .andWhere('category.userId = :userId', { userId })
      .groupBy('category.id')
      .orderBy('COUNT(transaction.id)', 'DESC')
      .limit(1)
      .getOne();

    return result || null;
  }

  private async autoDetermineWallet(
    transaction: Transaction,
    userId: string,
  ): Promise<string | undefined> {
    // Try to match by account number if available
    if (transaction.counterpartyAccount) {
      const wallet = await this.walletRepository.findOne({
        where: {
          userId,
          accountNumber: transaction.counterpartyAccount,
        },
      });

      if (wallet) {
        return wallet.id;
      }
    }

    // Match by wallet name presence in purpose/counterparty
    const wallets = await this.walletRepository.find({ where: { userId } });
    const searchText = `${transaction.counterpartyName} ${transaction.paymentPurpose}`.toLowerCase();
    const walletMatch = wallets.find((w) => searchText.includes((w.name || '').toLowerCase()));
    if (walletMatch) {
      return walletMatch.id;
    }

    // Get default wallet for user
    const defaultWallet = await this.walletRepository.findOne({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    return defaultWallet?.id;
  }

  private async autoDetermineBranch(
    transaction: Transaction,
    userId: string,
  ): Promise<string | undefined> {
    const branches = await this.branchRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    const searchText = `${transaction.counterpartyName} ${transaction.paymentPurpose}`.toLowerCase();
    const matched = branches.find((b) => searchText.includes((b.name || '').toLowerCase()));
    return (matched || branches[0])?.id;
  }

  private async getClassificationRules(userId: string): Promise<ClassificationRule[]> {
    const templates: Array<{
      name: string;
      field: ClassificationCondition['field'];
      operator: ClassificationCondition['operator'];
      value: string;
      category: string;
      type: CategoryType;
      priority: number;
      article?: string;
    }> = [
      {
        name: 'Kaspi Red payments',
        field: 'payment_purpose',
        operator: 'contains',
        value: 'kaspi red',
        category: 'Платежи Kaspi Red',
        type: CategoryType.EXPENSE,
        priority: 110,
      },
      {
        name: 'Kaspi Pay/комиссии',
        field: 'payment_purpose',
        operator: 'regex',
        value: 'kaspi\\s*pay|комисси.*kaspi',
        category: 'Комиссии Kaspi',
        type: CategoryType.EXPENSE,
        priority: 105,
      },
      {
        name: 'Kaspi sales',
        field: 'payment_purpose',
        operator: 'contains',
        value: 'продажи kaspi',
        category: 'Продажи Kaspi',
        type: CategoryType.INCOME,
        priority: 100,
      },
      {
        name: 'Salary payments',
        field: 'payment_purpose',
        operator: 'contains',
        value: 'зарплат',
        category: 'Зарплаты сотрудникам',
        type: CategoryType.EXPENSE,
        priority: 95,
      },
      {
        name: 'Rent',
        field: 'payment_purpose',
        operator: 'contains',
        value: 'аренд',
        category: 'Аренда',
        type: CategoryType.EXPENSE,
        priority: 90,
      },
      {
        name: 'Taxes',
        field: 'payment_purpose',
        operator: 'regex',
        value: 'налог|гпн|опв|осМС|соц(\\s|$)',
        category: 'Налоги',
        type: CategoryType.EXPENSE,
        priority: 88,
      },
      {
        name: 'Utilities',
        field: 'payment_purpose',
        operator: 'regex',
        value: 'коммунал|электр|газ|тепл|свет',
        category: 'Коммунальные услуги',
        type: CategoryType.EXPENSE,
        priority: 85,
      },
      {
        name: 'Marketing',
        field: 'payment_purpose',
        operator: 'regex',
        value: 'реклам|маркетинг',
        category: 'Маркетинг и реклама',
        type: CategoryType.EXPENSE,
        priority: 80,
      },
      {
        name: 'Logistics',
        field: 'payment_purpose',
        operator: 'contains',
        value: 'достав',
        category: 'Логистика и доставка',
        type: CategoryType.EXPENSE,
        priority: 75,
      },
      {
        name: 'Bank commission',
        field: 'payment_purpose',
        operator: 'contains',
        value: 'комисси',
        category: 'Комиссии банка',
        type: CategoryType.EXPENSE,
        priority: 70,
      },
      {
        name: 'Loans/credit',
        field: 'payment_purpose',
        operator: 'regex',
        value: 'кредит|займ|лизинг',
        category: 'Кредиты и займы',
        type: CategoryType.EXPENSE,
        priority: 65,
      },
      {
        name: 'Incoming payments',
        field: 'payment_purpose',
        operator: 'regex',
        value: 'поступлени|приход|оплата товара',
        category: 'Приход',
        type: CategoryType.INCOME,
        priority: 60,
      },
    ];

    const rules: ClassificationRule[] = [];
    for (const template of templates) {
      const categoryId = await this.ensureCategory(userId, template.category, template.type);
      if (!categoryId) continue;

      rules.push({
        name: template.name,
        type: 'category',
        conditions: [
          {
            field: template.field,
            operator: template.operator,
            value: template.value,
          },
        ],
        result: {
          categoryId,
          article: template.article,
        },
        priority: template.priority,
        isActive: true,
      });
    }

    return rules;
  }

  private async getCategoryIdByName(userId: string, categoryName: string): Promise<string | undefined> {
    return this.ensureCategory(userId, categoryName);
  }

  async classifyBulk(transactionIds: string[], userId: string): Promise<void> {
    // TODO: Implement bulk classification
    // This would process multiple transactions at once
  }

  private async ensureCategory(
    userId: string,
    categoryName: string,
    type: CategoryType = CategoryType.EXPENSE,
  ): Promise<string | undefined> {
    let category = await this.categoryRepository.findOne({
      where: { userId, name: categoryName },
    });

    if (!category) {
      category = this.categoryRepository.create({
        userId,
        name: categoryName,
        type,
        isSystem: false,
      });
      category = await this.categoryRepository.save(category);
    }

    return category?.id;
  }
}
