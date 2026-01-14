import { type GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { TimeoutError, retry, withTimeout } from '../../../common/utils/async.util';
import { normalizeDate, normalizeNumber } from '../../../common/utils/number-normalizer.util';
import type { ParsedTransaction } from '../interfaces/parsed-statement.interface';
import {
  isAiCircuitOpen,
  recordAiFailure,
  recordAiSuccess,
  withAiConcurrency,
} from './ai-runtime.util';

export class AiTransactionExtractor {
  private geminiModel: GenerativeModel | null = null;

  constructor(apiKey: string | undefined = process.env.GEMINI_API_KEY) {
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  isAvailable(): boolean {
    return !!this.geminiModel;
  }

  async extractTransactions(text: string): Promise<ParsedTransaction[]> {
    if (!this.geminiModel) {
      return [];
    }

    if (isAiCircuitOpen()) {
      return [];
    }

    const statementText = text.length > 20000 ? text.substring(0, 20000) : text;

    try {
      const timeoutMs = Number.parseInt(process.env.AI_TIMEOUT_MS || '20000', 10);

      const completion = await retry(
        () =>
          withTimeout(
            withAiConcurrency(() =>
              this.geminiModel?.generateContent({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: `Extract ALL transactions from this bank statement text (could be Kaspi Bank, Bereke Bank, or other Kazakhstan banks). Each transaction typically has: document number, date, debit amount, credit amount, counterparty name, account numbers, payment purpose. Return ONLY JSON with the shape {"transactions":[{date,document_number,counterparty_name,counterparty_bin,counterparty_account,counterparty_bank,debit,credit,purpose,currency}]}. Use ISO dates (YYYY-MM-DD). Numbers must be decimal (dot). Default currency KZT. Preserve full payment purpose. Extract ALL transactions you can find.\n\n${statementText}`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0,
                  responseMimeType: 'application/json',
                },
              }),
            ),
            Number.isFinite(timeoutMs) ? timeoutMs : 20000,
            'AI request timed out',
          ),
        {
          retries: 2,
          baseDelayMs: 500,
          maxDelayMs: 5000,
          isRetryable: error => error instanceof TimeoutError,
        },
      );

      const content = completion.response?.text();
      if (!content) {
        recordAiFailure();
        return [];
      }

      const parsed = JSON.parse(content);
      const rawTransactions = parsed?.transactions || parsed?.data?.transactions || [];

      if (!Array.isArray(rawTransactions)) {
        recordAiFailure();
        return [];
      }

      recordAiSuccess();
      return rawTransactions
        .map((tx: any) => this.mapTransaction(tx))
        .filter((tx): tx is ParsedTransaction => tx !== null);
    } catch (error) {
      recordAiFailure();
      console.error('[AIExtractor] Failed to extract via AI:', error);
      return [];
    }
  }

  private mapTransaction(raw: any): ParsedTransaction | null {
    const transactionDate =
      normalizeDate(raw?.date || raw?.transactionDate || raw?.date_iso) || null;

    if (!transactionDate) {
      return null;
    }

    const debit = normalizeNumber(raw?.debit ?? raw?.amount_debit ?? raw?.amount) || undefined;
    const credit = normalizeNumber(raw?.credit ?? raw?.amount_credit ?? raw?.incoming) || undefined;

    const counterpartyName =
      raw?.counterparty_name ||
      raw?.counterparty ||
      raw?.beneficiary ||
      raw?.receiver ||
      raw?.payer ||
      raw?.partner ||
      raw?.beneficiary_name ||
      'Неизвестный контрагент';

    const counterpartyBank =
      raw?.counterparty_bank ||
      raw?.bank ||
      raw?.bank_name ||
      raw?.beneficiary_bank ||
      raw?.receiver_bank ||
      raw?.bank_bic ||
      raw?.bic;

    const counterpartyBin = raw?.counterparty_bin || raw?.bin || raw?.iin || raw?.tax_id;

    return {
      transactionDate,
      documentNumber: raw?.document_number || raw?.document || raw?.doc || raw?.doc_number,
      counterpartyName,
      counterpartyBin,
      counterpartyAccount: raw?.counterparty_account || raw?.account,
      counterpartyBank,
      debit,
      credit,
      paymentPurpose:
        (raw?.purpose || raw?.payment_purpose || raw?.description || raw?.comment || '')
          .toString()
          .trim() || 'Не указано',
      currency: raw?.currency || 'KZT',
    };
  }
}
