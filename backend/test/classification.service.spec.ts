import { ClassificationService } from '../src/modules/classification/services/classification.service';
import { Transaction, TransactionType } from '../src/entities/transaction.entity';
import { Category, CategoryType } from '../src/entities/category.entity';
import { Branch } from '../src/entities/branch.entity';
import { Wallet } from '../src/entities/wallet.entity';

function createRepoMock<T>() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data) => data as T),
    save: jest.fn((data) => Promise.resolve(data as T)),
    createQueryBuilder: jest.fn(),
  } as any;
}

describe('ClassificationService', () => {
  let service: ClassificationService;
  const categoryRepo = createRepoMock<Category>();
  const branchRepo = createRepoMock<Branch>();
  const walletRepo = createRepoMock<Wallet>();

  beforeEach(() => {
    jest.clearAllMocks();
    walletRepo.find.mockResolvedValue([]);
    branchRepo.find.mockResolvedValue([]);
    service = new ClassificationService(categoryRepo, branchRepo, walletRepo);
  });

  it('should classify transaction with rule match and auto-fillers', async () => {
    const transaction = {
      credit: 1500,
      debit: null,
      counterpartyName: 'Kaspi',
      paymentPurpose: 'Продажи Kaspi',
    } as unknown as Transaction;

    jest.spyOn<any, any>(service as any, 'getClassificationRules').mockResolvedValue([
      {
        name: 'Kaspi sales',
        type: 'category',
        conditions: [
          {
            field: 'payment_purpose',
            operator: 'contains',
            value: 'Продажи',
          },
        ],
        result: {
          categoryId: 'cat-rule',
          walletId: 'wallet-rule',
          branchId: 'branch-rule',
        },
        priority: 100,
        isActive: true,
      },
    ]);

    jest.spyOn<any, any>(service as any, 'autoClassifyCategory').mockResolvedValue('cat-auto');
    jest.spyOn<any, any>(service as any, 'autoDetermineWallet').mockResolvedValue('wallet-auto');
    jest.spyOn<any, any>(service as any, 'autoDetermineBranch').mockResolvedValue('branch-auto');

    const result = await service.classifyTransaction(transaction, 'user-1');

    expect(result.transactionType).toBe(TransactionType.INCOME);
    expect(result.categoryId).toBe('cat-rule');
    expect(result.walletId).toBe('wallet-rule');
    expect(result.branchId).toBe('branch-rule');
  });

  it('should evaluate conditions correctly', () => {
    const evaluate = (service as any).evaluateCondition.bind(service);

    expect(evaluate('Kaspi Pay', { operator: 'contains', value: 'kaspi', field: 'payment_purpose' })).toBe(true);
    expect(evaluate('123', { operator: 'greater_than', value: '100', field: 'amount' })).toBe(true);
    expect(evaluate('99', { operator: 'greater_than', value: '100', field: 'amount' })).toBe(false);
    expect(evaluate('Kaspi', { operator: 'regex', value: 'kaspi|halyk', field: 'payment_purpose' })).toBe(true);
    expect(evaluate(null, { operator: 'contains', value: 'x', field: 'payment_purpose' })).toBe(false);
  });

  it('should sanitize rule order by priority when multiple match', async () => {
    const transaction = {
      debit: 300,
      credit: null,
      counterpartyName: 'Marketing LLC',
      paymentPurpose: 'Рекламные услуги',
    } as unknown as Transaction;

    jest.spyOn<any, any>(service as any, 'getClassificationRules').mockResolvedValue([
      {
        name: 'Low priority',
        type: 'category',
        conditions: [
          { field: 'payment_purpose', operator: 'contains', value: 'услуги' },
        ],
        result: { categoryId: 'cat-low' },
        priority: 10,
        isActive: true,
      },
      {
        name: 'High priority',
        type: 'category',
        conditions: [
          { field: 'payment_purpose', operator: 'contains', value: 'реклам' },
        ],
        result: { categoryId: 'cat-high' },
        priority: 90,
        isActive: true,
      },
    ]);

    jest.spyOn<any, any>(service as any, 'autoClassifyCategory').mockResolvedValue('fallback');
    jest.spyOn<any, any>(service as any, 'autoDetermineWallet').mockResolvedValue(undefined);
    jest.spyOn<any, any>(service as any, 'autoDetermineBranch').mockResolvedValue(undefined);

    const result = await service.classifyTransaction(transaction, 'user-2');

    expect(result.transactionType).toBe(TransactionType.EXPENSE);
    expect(result.categoryId).toBe('cat-high');
  });
});
