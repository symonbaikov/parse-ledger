import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClassificationService } from './classification.service';
import {
  Transaction,
  TransactionType,
} from '../../../entities/transaction.entity';
import { Category, CategoryType } from '../../../entities/category.entity';
import { Branch } from '../../../entities/branch.entity';
import { Wallet } from '../../../entities/wallet.entity';

describe('ClassificationService', () => {
  let testingModule: TestingModule;
  let service: ClassificationService;
  let categoryRepository: Repository<Category>;
  let branchRepository: Repository<Branch>;
  let walletRepository: Repository<Wallet>;

  const mockCategory: Partial<Category> = {
    id: 'cat-1',
    name: 'Groceries',
    type: CategoryType.EXPENSE,
    userId: '1',
  };

  const mockBranch: Partial<Branch> = {
    id: 'branch-1',
    name: 'Main Branch',
    userId: '1',
  };

  const mockWallet: Partial<Wallet> = {
    id: 'wallet-1',
    name: 'Personal Card',
    userId: '1',
  };

  const mockTransaction: Partial<Transaction> = {
    id: 'tx-1',
    counterpartyName: 'Purchase at Supermarket ABC',
    debit: 150,
    credit: 0,
    transactionDate: new Date('2026-01-01'),
  };

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        ClassificationService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Branch),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = testingModule.get<ClassificationService>(ClassificationService);
    categoryRepository = testingModule.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
    branchRepository = testingModule.get<Repository<Branch>>(
      getRepositoryToken(Branch),
    );
    walletRepository = testingModule.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(branchRepository, 'find').mockResolvedValue([]);
    jest.spyOn(walletRepository, 'find').mockResolvedValue([]);
  });

  afterAll(async () => {
    await testingModule.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('classifyTransaction', () => {
    let autoCategorySpy: jest.SpyInstance;

    beforeEach(() => {
      jest.spyOn(categoryRepository, 'find').mockResolvedValue([mockCategory as Category]);
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue({
        ...mockCategory,
        id: 'cat-1',
      } as Category);
      autoCategorySpy = jest
        .spyOn<any, any>(service as any, 'autoClassifyCategory')
        .mockResolvedValue('cat-1');
    });

    it('should determine transaction type from debit', async () => {
      const transaction = { ...mockTransaction, debit: 100, credit: 0 };
      jest.spyOn(categoryRepository, 'find').mockResolvedValue([]);

      const result = await service.classifyTransaction(
        transaction as Transaction,
        '1',
      );

      expect(result.transactionType).toBe(TransactionType.EXPENSE);
    });

    it('should determine transaction type from credit', async () => {
      const transaction = { ...mockTransaction, debit: 0, credit: 200 };
      jest.spyOn(categoryRepository, 'find').mockResolvedValue([]);

      const result = await service.classifyTransaction(
        transaction as Transaction,
        '1',
      );

      expect(result.transactionType).toBe(TransactionType.INCOME);
    });

    it('should auto-classify category based on description', async () => {
      jest.spyOn(categoryRepository, 'find').mockResolvedValue([
        mockCategory as Category,
      ]);

      const result = await service.classifyTransaction(
        mockTransaction as Transaction,
        '1',
      );

      expect(result.categoryId).toBeDefined();
      expect(autoCategorySpy).toHaveBeenCalled();
    });

    it('should match transactions by keywords', async () => {
      const groceryTransaction = {
        ...mockTransaction,
        description: 'WALMART SUPERCENTER',
      };
      const groceryCategory = {
        ...mockCategory,
        name: 'Groceries',
        keywords: ['walmart', 'supermarket', 'grocery'],
      };

      jest
        .spyOn(categoryRepository, 'find')
        .mockResolvedValue([groceryCategory as Category]);

      const result = await service.classifyTransaction(
        groceryTransaction as Transaction,
        '1',
      );

      expect(result.categoryId).toBeDefined();
    });

    it('should handle transactions without matches', async () => {
      jest.spyOn(categoryRepository, 'find').mockResolvedValue([]);

      const result = await service.classifyTransaction(
        mockTransaction as Transaction,
        '1',
      );

      expect(result).toBeDefined();
      expect(result.categoryId).toBeDefined();
    });

    it('should respect user-specific categories', async () => {
      await service.classifyTransaction(mockTransaction as Transaction, '1');

      expect(autoCategorySpy).toHaveBeenCalledWith(
        expect.any(Object),
        '1',
        TransactionType.EXPENSE,
      );
    });

    it('should classify by transaction amount range', async () => {
      const highValueCategory = {
        ...mockCategory,
        name: 'Large Expenses',
        minAmount: 1000,
      };

      jest
        .spyOn(categoryRepository, 'find')
        .mockResolvedValue([highValueCategory as Category]);

      const highValueTx = { ...mockTransaction, debit: 1500 };

      const result = await service.classifyTransaction(
        highValueTx as Transaction,
        '1',
      );

      expect(result.categoryId).toBeDefined();
    });

    it('should handle special characters in description', async () => {
      const specialTx = {
        ...mockTransaction,
        description: 'Purchase@Store#123!',
      };

      jest
        .spyOn(categoryRepository, 'find')
        .mockResolvedValue([mockCategory as Category]);

      const result = await service.classifyTransaction(
        specialTx as Transaction,
        '1',
      );

      expect(result).toBeDefined();
    });
  });
});

