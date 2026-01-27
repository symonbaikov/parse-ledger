import { type GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { TimeoutError, retry, withTimeout } from '../../../common/utils/async.util';
import { normalizeDate, normalizeNumber } from '../../../common/utils/number-normalizer.util';
import { extractTextFromPdf } from '../../../common/utils/pdf-parser.util';
import type { ParsedStatement, ParsedTransaction } from '../interfaces/parsed-statement.interface';
import {
  isAiCircuitOpen,
  isAiEnabled,
  recordAiFailure,
  recordAiSuccess,
  redactSensitive,
  withAiConcurrency,
} from './ai-runtime.util';

export class AiParseValidator {
  private geminiModel: GenerativeModel | null = null;

  constructor(apiKey: string | undefined = process.env.GEMINI_API_KEY) {
    if (apiKey && isAiEnabled()) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.geminiModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });
    }
  }

  isAvailable(): boolean {
    return !!this.geminiModel && isAiEnabled();
  }

  async reconcileFromPdf(
    filePath: string,
    parsed: ParsedStatement,
  ): Promise<{ corrected: ParsedStatement; notes: string[] }> {
    if (!this.geminiModel) {
      return { corrected: parsed, notes: [] };
    }

    if (isAiCircuitOpen()) {
      return {
        corrected: parsed,
        notes: ['AI temporarily disabled (circuit breaker)'],
      };
    }

    const pdfTextRaw = await extractTextFromPdf(filePath);
    const pdfText = pdfTextRaw.length > 18000 ? pdfTextRaw.substring(0, 18000) : pdfTextRaw;
    const parsedPreview = JSON.stringify(parsed.transactions.slice(0, 20));
    const redactedPdf = redactSensitive(pdfText);
    const redactedPreview = redactSensitive(parsedPreview);

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
                        text: `You are an auditor for Bereke Bank statements. Compare PDF text with parsed transactions and correct mistakes or missing rows. Return ONLY JSON with shape {"transactions":[...],"notes":[...],"metadata":{...}}. Dates must be ISO (YYYY-MM-DD). Numbers should be decimal (dot). Use KZT currency.\n\nPDF text snippet (redacted):\n${redactedPdf}\n\nParsed transactions preview (redacted):\n${redactedPreview}`,
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
        return { corrected: parsed, notes: ['AI returned empty content'] };
      }

      const data = JSON.parse(content);
      const rawTransactions = data?.transactions || data?.data?.transactions || parsed.transactions;

      const mapped = Array.isArray(rawTransactions)
        ? rawTransactions
            .map((tx: any) => this.mapTransaction(tx))
            .filter((tx): tx is ParsedTransaction => tx !== null)
        : parsed.transactions;

      const notes = Array.isArray(data?.notes) ? data.notes.map((n: any) => String(n)) : [];

      const meta = data?.metadata || {};
      const corrected: ParsedStatement = {
        metadata: {
          ...parsed.metadata,
          accountNumber: meta.accountNumber || parsed.metadata.accountNumber,
          dateFrom:
            normalizeDate(meta.dateFrom || meta.date_from || '') || parsed.metadata.dateFrom,
          dateTo: normalizeDate(meta.dateTo || meta.date_to || '') || parsed.metadata.dateTo,
          balanceStart:
            normalizeNumber(meta.balanceStart || meta.balance_start) ??
            parsed.metadata.balanceStart,
          balanceEnd:
            normalizeNumber(meta.balanceEnd || meta.balance_end) ?? parsed.metadata.balanceEnd,
          currency: meta.currency || parsed.metadata.currency || 'KZT',
        },
        transactions: mapped.length ? mapped : parsed.transactions,
      };

      recordAiSuccess();
      return { corrected, notes };
    } catch (error) {
      recordAiFailure();
      console.error('[AIValidator] Failed to reconcile via AI:', error);
      return { corrected: parsed, notes: ['AI reconciliation failed'] };
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
