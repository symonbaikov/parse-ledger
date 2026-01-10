import { StatementProcessingService } from '../src/modules/parsing/services/statement-processing.service';
import { Statement, StatementStatus, FileType, BankName } from '../src/entities/statement.entity';
import { Transaction } from '../src/entities/transaction.entity';
import { ParsedStatement } from '../src/modules/parsing/interfaces/parsed-statement.interface';

describe('StatementProcessingService', () => {
  const statement: Statement = {
    id: 'stmt-1',
    userId: 'user-1',
    user: null as any,
    fileName: 'sample.pdf',
    filePath: '/tmp/sample.pdf',
    fileType: FileType.PDF,
    fileSize: 1024,
    fileHash: 'hash',
    bankName: BankName.OTHER,
    accountNumber: null,
    statementDateFrom: null,
    statementDateTo: null,
    balanceStart: null,
    balanceEnd: null,
    status: StatementStatus.UPLOADED,
    errorMessage: null,
    totalTransactions: 0,
    totalDebit: 0,
    totalCredit: 0,
    currency: 'KZT',
    googleSheet: null,
    googleSheetId: null,
    transactions: [] as Transaction[],
    createdAt: new Date(),
    updatedAt: new Date(),
    processedAt: null,
    parsingDetails: null,
  } as unknown as Statement;

  const savedTransactions: Transaction[] = [];

  const statementRepository = {
    findOne: jest.fn(async ({ where: { id } }) => (id === statement.id ? statement : null)),
    save: jest.fn(async (entity: Partial<Statement>) => {
      Object.assign(statement, entity);
      return statement;
    }),
  };

  const transactionRepository = {
    create: jest.fn((data: Partial<Transaction>) => data as Transaction),
    save: jest.fn(async (data: Partial<Transaction>) => {
      const saved = { id: `tx-${savedTransactions.length + 1}`, ...data } as Transaction;
      savedTransactions.push(saved);
      return saved;
    }),
  };

  const classificationService = {
    classifyTransaction: jest.fn(async () => ({ categoryId: 'cat-1' })),
    determineMajorityCategory: jest.fn(async () => ({ categoryId: 'cat-1', type: 'expense' as any })),
  };

  const parsedStatement: ParsedStatement = {
    metadata: {
      accountNumber: '',
      dateFrom: null as unknown as Date,
      dateTo: null as unknown as Date,
      balanceStart: undefined,
      balanceEnd: undefined,
      currency: '',
    },
    transactions: [
      {
        transactionDate: new Date('2024-01-05'),
        documentNumber: 'DOC-1',
        counterpartyName: 'Supplier LLC',
        counterpartyBin: '123456789012',
        counterpartyAccount: 'KZACC123',
        counterpartyBank: 'Bereke',
        debit: 100,
        credit: undefined,
        paymentPurpose: 'Invoice payment',
        currency: 'USD',
        exchangeRate: 1,
        amountForeign: 100,
      },
      {
        transactionDate: new Date('2024-01-10'),
        documentNumber: 'DOC-2',
        counterpartyName: 'Customer LLC',
        counterpartyBin: '987654321000',
        counterpartyAccount: 'KZACC456',
        counterpartyBank: 'Bereke',
        debit: undefined,
        credit: 200,
        paymentPurpose: 'Sale income',
        currency: 'USD',
        exchangeRate: 1,
        amountForeign: 200,
      },
    ],
  };

  const parserFactory = {
    detectBankAndFormat: jest.fn(async () => ({ bankName: BankName.BEREKE_NEW, formatVersion: 'v1' })),
    getParser: jest.fn(async () => ({
      parse: jest.fn().mockResolvedValue(parsedStatement),
      constructor: { name: 'FakeParser' },
    })),
  };

  let service: StatementProcessingService;

  beforeEach(() => {
    jest.clearAllMocks();
    savedTransactions.length = 0;
    service = new StatementProcessingService(
      statementRepository as any,
      transactionRepository as any,
      parserFactory as any,
      classificationService as any,
      undefined,
    );

    // Disable AI reconciliation for deterministic tests
    (service as any).aiValidator = {
      isAvailable: () => false,
    };
  });

  it('fills statement metadata and transactions with parsed details', async () => {
    await service.processStatement(statement.id);

    expect(statement.accountNumber).toBe('KZACC123');
    expect(statement.statementDateFrom?.toISOString()).toContain('2024-01-05');
    expect(statement.statementDateTo?.toISOString()).toContain('2024-01-10');
    expect(statement.currency).toBe('USD');
    expect(statement.status).toBe(StatementStatus.PARSED);

    expect(statement.parsingDetails?.metadataExtracted).toMatchObject({
      accountNumber: 'KZACC123',
      currency: 'USD',
    });
    expect(statement.parsingDetails?.transactionsFound).toBe(2);

    expect(savedTransactions).toHaveLength(2);
    expect(savedTransactions[0]).toMatchObject({
      documentNumber: 'DOC-1',
      counterpartyBin: '123456789012',
      counterpartyAccount: 'KZACC123',
      counterpartyBank: 'Bereke',
      paymentPurpose: 'Invoice payment',
      exchangeRate: 1,
      amountForeign: 100,
      currency: 'USD',
    });
    expect(statement.totalDebit).toBe(100);
    expect(statement.totalCredit).toBe(200);
  });
});
