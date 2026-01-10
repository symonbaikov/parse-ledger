import { Injectable, Logger, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Statement, StatementStatus } from '../../../entities/statement.entity';
import { Transaction, TransactionType } from '../../../entities/transaction.entity';
import { ParserFactoryService } from './parser-factory.service';
import { ParsedTransaction } from '../interfaces/parsed-statement.interface';
import { BankName } from '../../../entities/statement.entity';
import { ClassificationService } from '../../classification/services/classification.service';
import { GoogleSheetsService } from '../../google-sheets/google-sheets.service';
import { AiParseValidator } from '../helpers/ai-parse-validator.helper';
import { ParsedStatement } from '../interfaces/parsed-statement.interface';

@Injectable()
export class StatementProcessingService {
  private readonly logger = new Logger(StatementProcessingService.name);
  private aiValidator = new AiParseValidator();

  constructor(
    @InjectRepository(Statement)
    private statementRepository: Repository<Statement>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private parserFactory: ParserFactoryService,
    private classificationService: ClassificationService,
    @Optional()
    @Inject(forwardRef(() => GoogleSheetsService))
    private googleSheetsService?: GoogleSheetsService,
  ) {}

  private getFileExtension(statement: Statement): string {
    switch (statement.fileType) {
      case 'pdf':
        return 'pdf';
      case 'xlsx':
        return 'xlsx';
      case 'csv':
        return 'csv';
      case 'image':
        return 'jpg';
      default:
        return 'bin';
    }
  }

  private async ensureFileAvailable(statement: Statement): Promise<{
    filePath: string;
    tempFilePath?: string;
  }> {
    if (statement.filePath && fs.existsSync(statement.filePath)) {
      return { filePath: statement.filePath };
    }

    const withData = await this.statementRepository
      .createQueryBuilder('statement')
      .addSelect('statement.fileData')
      .where('statement.id = :id', { id: statement.id })
      .getOne();

    let fileData: Buffer | null | undefined = (withData as any)?.fileData;

    if (!fileData && statement.fileHash) {
      const alternative = await this.statementRepository
        .createQueryBuilder('statement')
        .addSelect('statement.fileData')
        .where('statement.userId = :userId', { userId: statement.userId })
        .andWhere('statement.fileHash = :fileHash', { fileHash: statement.fileHash })
        .andWhere('statement.fileData IS NOT NULL')
        .orderBy('statement.createdAt', 'DESC')
        .getOne();
      fileData = (alternative as any)?.fileData;
    }

    if (!fileData) {
      throw new Error(`File not found: ${statement.filePath}`);
    }

    const ext = this.getFileExtension(statement);
    const tempFilePath = path.join(os.tmpdir(), `finflow-statement-${statement.id}-${Date.now()}.${ext}`);
    await fs.promises.writeFile(tempFilePath, fileData);
    return { filePath: tempFilePath, tempFilePath };
  }

  async processStatement(statementId: string): Promise<Statement> {
    const startTime = Date.now();
    const parsingDetails: Statement['parsingDetails'] = {
      logEntries: [],
      errors: [],
      warnings: [],
    };

    const addLog = (level: string, message: string) => {
      const timestamp = new Date().toISOString();
      parsingDetails.logEntries = parsingDetails.logEntries || [];
      parsingDetails.logEntries.push({ timestamp, level, message });
      this.logger[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        `[${statementId}] ${message}`,
      );
    };

    const statement = await this.statementRepository.findOne({
      where: { id: statementId },
    });

    if (!statement) {
      throw new Error(`Statement ${statementId} not found`);
    }

    addLog('info', `Starting processing of statement ${statementId}`);
    addLog('info', `File: ${statement.fileName} (${statement.fileType}, ${statement.fileSize} bytes)`);

    let tempFilePath: string | undefined;
    let processingFilePath = statement.filePath;

    try {
      const ensured = await this.ensureFileAvailable(statement);
      processingFilePath = ensured.filePath;
      tempFilePath = ensured.tempFilePath;

      // Update status to processing
      statement.status = StatementStatus.PROCESSING;
      statement.parsingDetails = parsingDetails;
      await this.statementRepository.save(statement);

      // Detect bank and format
      addLog('info', `Detecting bank and format for file type: ${statement.fileType}`);
      const detectStartTime = Date.now();
      const { bankName, formatVersion } = await this.parserFactory.detectBankAndFormat(
        processingFilePath,
        statement.fileType,
      );
      const detectTime = Date.now() - detectStartTime;
      
      parsingDetails.detectedBank = bankName;
      parsingDetails.detectedFormat = formatVersion;
      addLog('info', `Detected bank: ${bankName}, format: ${formatVersion || 'unknown'} (${detectTime}ms)`);

      statement.bankName = bankName;
      await this.statementRepository.save(statement);

      // Get appropriate parser
      addLog('info', `Looking for parser for bank ${bankName} and file type ${statement.fileType}`);
      const parser = await this.parserFactory.getParser(
        bankName,
        statement.fileType,
        processingFilePath,
      );

      if (!parser) {
        const errorMsg = `No parser found for bank ${bankName} and file type ${statement.fileType}`;
        addLog('error', errorMsg);
        parsingDetails.errors = parsingDetails.errors || [];
        parsingDetails.errors.push(errorMsg);
        throw new Error(errorMsg);
      }

      parsingDetails.parserUsed = parser.constructor.name;
      addLog('info', `Using parser: ${parser.constructor.name}`);

      // Parse statement
      addLog('info', 'Starting PDF text extraction...');
      const parseStartTime = Date.now();
      let parsedStatement = await parser.parse(processingFilePath);
      const parseTime = Date.now() - parseStartTime;
      
      addLog('info', `Parsing completed in ${parseTime}ms`);
      addLog('info', `Found ${parsedStatement.transactions.length} transactions in parsed data`);

      // AI reconciliation with PDF text to correct/match results
      if (this.aiValidator.isAvailable()) {
        addLog('info', 'Running AI reconciliation between PDF and parsed result...');
        const aiResult = await this.aiValidator.reconcileFromPdf(
          processingFilePath,
          parsedStatement,
        );
        parsedStatement = aiResult.corrected;
        if (aiResult.notes.length) {
          aiResult.notes.forEach((note) => addLog('info', `[AI] ${note}`));
        }
        addLog(
          'info',
          `After AI reconciliation: ${parsedStatement.transactions.length} transactions`,
        );
      } else {
        addLog('info', 'AI reconciliation skipped (no GEMINI_API_KEY set)');
      }

      parsingDetails.transactionsFound = parsedStatement.transactions.length;
      const enrichedMetadata = this.buildCompleteMetadata(
        parsedStatement,
        parsedStatement.transactions,
      );
      parsingDetails.metadataExtracted = {
        accountNumber: enrichedMetadata.accountNumber || undefined,
        dateFrom: enrichedMetadata.dateFrom?.toISOString(),
        dateTo: enrichedMetadata.dateTo?.toISOString(),
        balanceStart: enrichedMetadata.balanceStart ?? undefined,
        balanceEnd: enrichedMetadata.balanceEnd ?? undefined,
        currency: enrichedMetadata.currency,
      };

      // Update statement metadata using enriched values to avoid blanks
      statement.accountNumber = enrichedMetadata.accountNumber;
      statement.statementDateFrom = enrichedMetadata.dateFrom;
      statement.statementDateTo = enrichedMetadata.dateTo;
      statement.balanceStart = enrichedMetadata.balanceStart;
      statement.balanceEnd = enrichedMetadata.balanceEnd;
      statement.currency = enrichedMetadata.currency;

      addLog('info', `Metadata extracted - Account: ${statement.accountNumber || 'N/A'}, Currency: ${statement.currency}`);
      addLog('info', `Date range: ${statement.statementDateFrom?.toISOString() || 'N/A'} to ${statement.statementDateTo?.toISOString() || 'N/A'}`);

      // Create transactions with classification
      const majorityCategory = await this.classificationService.determineMajorityCategory(
        parsedStatement.transactions,
        statement.userId,
      );

      addLog('info', 'Creating transactions and applying classification...');
      const createStartTime = Date.now();
      const transactions = await this.createTransactions(
        statement,
        parsedStatement.transactions,
        statement.userId,
        majorityCategory.categoryId,
        addLog,
      );
      const createTime = Date.now() - createStartTime;
      
      addLog('info', `Created ${transactions.length} transactions in ${createTime}ms`);
      parsingDetails.transactionsCreated = transactions.length;

      statement.totalTransactions = transactions.length;
      statement.totalDebit = transactions.reduce((sum, t) => sum + (t.debit ?? 0), 0);
      statement.totalCredit = transactions.reduce((sum, t) => sum + (t.credit ?? 0), 0);
      if (majorityCategory.categoryId) {
        statement.categoryId = majorityCategory.categoryId;
      }

      addLog('info', `Totals - Debit: ${statement.totalDebit}, Credit: ${statement.totalCredit}`);

      // Update status
      const totalTime = Date.now() - startTime;
      parsingDetails.processingTime = totalTime;
      statement.status = StatementStatus.PARSED;
      statement.processedAt = new Date();
      statement.parsingDetails = parsingDetails;
      await this.statementRepository.save(statement);

      addLog('info', `Successfully processed statement ${statementId}: ${transactions.length} transactions (total time: ${totalTime}ms)`);

      // Auto-sync to Google Sheets if connected (async, non-blocking)
      if (statement.googleSheetId && this.googleSheetsService) {
        this.syncToGoogleSheets(statement.googleSheetId, statementId, statement.userId).catch(
          (error) => {
            this.logger.error(
              `Failed to auto-sync statement ${statementId} to Google Sheets:`,
              error,
            );
            // Don't throw - sync failure shouldn't fail the whole process
          },
        );
      }

      return statement;
    } catch (error) {
      const errorMsg = `Error processing statement ${statementId}: ${error.message}`;
      addLog('error', errorMsg);
      parsingDetails.errors = parsingDetails.errors || [];
      parsingDetails.errors.push(error.message);
      parsingDetails.processingTime = Date.now() - startTime;
      
      statement.status = StatementStatus.ERROR;
      statement.errorMessage = error.message;
      statement.parsingDetails = parsingDetails;
      await this.statementRepository.save(statement);
      
      this.logger.error(`Error processing statement ${statementId}:`, error);
      throw error;
    } finally {
      if (tempFilePath) {
        fs.promises.unlink(tempFilePath).catch(() => undefined);
      }
    }
  }

  private async createTransactions(
    statement: Statement,
    parsedTransactions: ParsedTransaction[],
    userId: string,
    defaultCategoryId: string | undefined,
    addLog?: (level: string, message: string) => void,
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const log = addLog || ((level: string, msg: string) => this.logger[level === 'error' ? 'error' : 'log'](msg));

    log('info', `Processing ${parsedTransactions.length} parsed transactions (statement currency: ${statement.currency || 'N/A'})`);

    for (let i = 0; i < parsedTransactions.length; i++) {
      const parsed = parsedTransactions[i];
      
      try {
        const counterpartyName =
          (parsed.counterpartyName || '').trim() || 'Неизвестный контрагент';
        const paymentPurpose = (parsed.paymentPurpose || '').trim() || 'Не указано';

        // Determine transaction type
        const transactionType =
          parsed.debit && parsed.debit > 0
            ? TransactionType.EXPENSE
            : parsed.credit && parsed.credit > 0
              ? TransactionType.INCOME
              : TransactionType.INCOME;

        // Calculate amount preserving zero values
        const amount = (parsed.debit ?? parsed.credit ?? 0) as number;

        // Classify transaction first (before creating entity)
        const tempTransaction = {
          transactionDate: parsed.transactionDate,
          documentNumber: parsed.documentNumber,
          counterpartyName,
          counterpartyBin: parsed.counterpartyBin,
          counterpartyAccount: parsed.counterpartyAccount,
          counterpartyBank: parsed.counterpartyBank,
          debit: parsed.debit ?? null,
          credit: parsed.credit ?? null,
          amount,
          currency: parsed.currency || statement.currency || 'KZT',
          paymentPurpose,
          transactionType,
        } as Transaction;

        const classification = await this.classificationService.classifyTransaction(
          tempTransaction,
          userId,
        );
        if (!classification.categoryId && defaultCategoryId) {
          classification.categoryId = defaultCategoryId;
        }

        const currency = parsed.currency || statement.currency || 'KZT';
        const exchangeRate = parsed.exchangeRate ?? null;
        const amountForeign = parsed.amountForeign ?? null;

        // Create transaction with classification
        const transaction = this.transactionRepository.create({
          statementId: statement.id,
          transactionDate: parsed.transactionDate,
          documentNumber: parsed.documentNumber,
          counterpartyName,
          counterpartyBin: parsed.counterpartyBin,
          counterpartyAccount: parsed.counterpartyAccount,
          counterpartyBank: parsed.counterpartyBank,
          debit: parsed.debit,
          credit: parsed.credit,
          amount,
          currency,
          exchangeRate,
          amountForeign,
          paymentPurpose,
          transactionType,
          ...classification,
        });

        const saved = await this.transactionRepository.save(transaction);
        transactions.push(saved);

        const missing: string[] = [];
        if (!counterpartyName || /неизвест/i.test(counterpartyName)) {
          missing.push('counterparty');
        }
        if (!paymentPurpose || paymentPurpose === 'Не указано') {
          missing.push('purpose');
        }
        if (!classification.categoryId) {
          missing.push('category');
        }
        if (!classification.branchId) {
          missing.push('branch');
        }
        if (!classification.walletId) {
          missing.push('wallet');
        }

        if (missing.length && (i < 5 || i === parsedTransactions.length - 1)) {
          log(
            'warn',
            `Transaction ${i + 1} (${parsed.documentNumber || 'no doc'}): missing ${missing.join(
              ', ',
            )}`,
          );
        } else if (classification.categoryId || classification.branchId || classification.walletId) {
          log(
            'info',
            `Transaction ${i + 1} classification -> cat: ${
              classification.categoryId || '—'
            }, branch: ${classification.branchId || '—'}, wallet: ${
              classification.walletId || '—'
            }`,
          );
        }

        if ((i + 1) % 10 === 0) {
          log('info', `Processed ${i + 1}/${parsedTransactions.length} transactions`);
        }
      } catch (error) {
        const errorMsg = `Error creating transaction ${i + 1}: ${error.message}`;
        log('error', errorMsg);
        // Continue processing other transactions
      }
    }

    log('info', `Successfully created ${transactions.length}/${parsedTransactions.length} transactions`);
    return transactions;
  }

  /**
   * Sync transactions to Google Sheets (async, non-blocking)
   */
  private async syncToGoogleSheets(
    googleSheetId: string,
    statementId: string,
    userId: string,
  ): Promise<void> {
    if (!this.googleSheetsService) {
      this.logger.warn('GoogleSheetsService not available, skipping sync');
      return;
    }

    try {
      const result = await this.googleSheetsService.syncStatementTransactions(
        googleSheetId,
        statementId,
        userId,
      );
      this.logger.log(
        `Auto-synced ${result.synced} transactions from statement ${statementId} to Google Sheet ${googleSheetId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error auto-syncing statement ${statementId} to Google Sheet ${googleSheetId}:`,
        error,
      );
      // Re-throw to be caught by caller
      throw error;
    }
  }

  private buildCompleteMetadata(
    parsed: ParsedStatement,
    transactions: ParsedTransaction[],
  ): {
    accountNumber: string;
    dateFrom: Date;
    dateTo: Date;
    balanceStart: number | null | undefined;
    balanceEnd: number | null | undefined;
    currency: string;
  } {
    const transactionDates = transactions
      .map((t) => t.transactionDate)
      .filter((d): d is Date => !!d);

    const minDate =
      transactionDates.length > 0
        ? new Date(Math.min(...transactionDates.map((d) => d.getTime())))
        : null;
    const maxDate =
      transactionDates.length > 0
        ? new Date(Math.max(...transactionDates.map((d) => d.getTime())))
        : null;

    const fallbackAccount =
      transactions.find((t) => t.counterpartyAccount)?.counterpartyAccount ||
      transactions.find((t) => t.counterpartyBin)?.counterpartyBin ||
      'Unknown';

    const currencyFromTransactions = transactions.find((t) => t.currency)?.currency;

    const accountNumber = (parsed.metadata.accountNumber || '').trim() || fallbackAccount;
    const dateFrom = parsed.metadata.dateFrom || minDate || new Date();
    const dateTo = parsed.metadata.dateTo || maxDate || dateFrom;
    const balanceStart = parsed.metadata.balanceStart ?? null;
    const balanceEnd = parsed.metadata.balanceEnd ?? null;
    const currency = parsed.metadata.currency || currencyFromTransactions || 'KZT';

    return { accountNumber, dateFrom, dateTo, balanceStart, balanceEnd, currency };
  }
}
