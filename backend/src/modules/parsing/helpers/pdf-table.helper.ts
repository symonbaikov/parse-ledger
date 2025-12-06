import { ParsedTransaction } from '../interfaces/parsed-statement.interface';
import { normalizeDate, normalizeNumber } from '../../../common/utils/number-normalizer.util';

type TableColumnKey =
  | 'date'
  | 'document'
  | 'counterparty'
  | 'bin'
  | 'account'
  | 'bank'
  | 'debit'
  | 'credit'
  | 'purpose'
  | 'currency'
  | 'knp';

export interface TableParsingOptions {
  defaultCurrency?: string;
  stopWords?: string[];
}

const DATE_REGEX = /\d{2}\.\d{2}\.\d{4}(?:\s+\d{2}:\d{2}:\d{2})?/;
const DEFAULT_STOP_WORDS = ['итого', 'оборот', 'остаток'];

export function mapPdfTableRowsToTransactions(
  tableRows: string[][],
  options?: TableParsingOptions,
): ParsedTransaction[] {
  const normalized = (tableRows || [])
    .map((row) => (row || []).map((cell) => sanitizeCell(cell)))
    .filter((row) => row.some((cell) => cell));

  if (!normalized.length) {
    return [];
  }

  const headerIndex = normalized.findIndex((row) => isHeaderRow(row));
  if (headerIndex === -1) {
    return [];
  }

  const header = normalized[headerIndex];
  const columnMap = buildColumnMap(header);
  const dataRows = normalized.slice(headerIndex + 1);
  const stopWords = options?.stopWords?.map((w) => w.toLowerCase()) || DEFAULT_STOP_WORDS;

  const transactions: ParsedTransaction[] = [];
  let current: ParsedTransaction | null = null;

  for (const row of dataRows) {
    const rowText = row.join(' ').toLowerCase();
    if (stopWords.some((word) => rowText.includes(word))) {
      break;
    }

    const dateValue = pickDateValue(row, columnMap);
    const parsedDate = dateValue ? normalizeDate(dateValue) : null;

    if (parsedDate) {
      if (current) {
        transactions.push(current);
      }
      current = buildTransactionFromRow(row, parsedDate, columnMap, options);
      continue;
    }

    if (current) {
      const continuation = collectContinuation(row, columnMap);
      if (continuation) {
        current.paymentPurpose = `${current.paymentPurpose} ${continuation}`.trim();
      }
    }
  }

  if (current) {
    transactions.push(current);
  }

  return transactions;
}

export function mergeTransactions(
  primary: ParsedTransaction[],
  secondary: ParsedTransaction[],
): ParsedTransaction[] {
  const result: ParsedTransaction[] = [];
  const seen = new Set<string>();

  const pushUnique = (tx: ParsedTransaction) => {
    const key = buildSignature(tx);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(tx);
  };

  primary.forEach(pushUnique);
  secondary.forEach(pushUnique);

  return result;
}

function buildSignature(tx: ParsedTransaction): string {
  const datePart = tx.transactionDate
    ? tx.transactionDate.toISOString().split('T')[0]
    : 'no-date';
  const amount = tx.debit ?? tx.credit ?? 0;
  const doc = tx.documentNumber || '';
  const name = (tx.counterpartyName || '').toLowerCase();
  return `${datePart}|${doc}|${name}|${amount}`;
}

function sanitizeCell(cell: unknown): string {
  if (cell === null || cell === undefined) {
    return '';
  }
  return cell.toString().replace(/\s+/g, ' ').trim();
}

function isHeaderRow(row: string[]): boolean {
  const lowerJoined = row.join(' ').toLowerCase();
  const keywords = [
    'дата',
    'date',
    'номер',
    'документ',
    'контрагент',
    'получател',
    'плательщ',
    'бин',
    'iin',
    'счет',
    'счёт',
    'account',
    'банк',
    'debit',
    'дебет',
    'credit',
    'кредит',
    'назначение',
    'основание',
    'purpose',
  ];

  const matches = keywords.filter((kw) => lowerJoined.includes(kw)).length;
  return matches >= 2;
}

function buildColumnMap(header: string[]): Partial<Record<TableColumnKey, number>> {
  const map: Partial<Record<TableColumnKey, number>> = {};

  header.forEach((cell, index) => {
    const lower = cell.toLowerCase();
    if (map.date === undefined && (lower.includes('дата') || lower.includes('date'))) {
      map.date = index;
    }
    if (
      map.document === undefined &&
      (lower.includes('номер') || lower.includes('документ') || lower.includes('document'))
    ) {
      map.document = index;
    }
    if (
      map.counterparty === undefined &&
      (lower.includes('контрагент') ||
        lower.includes('получател') ||
        lower.includes('платель') ||
        lower.includes('beneficiary'))
    ) {
      map.counterparty = index;
    }
    if (map.bin === undefined && (lower.includes('бин') || lower.includes('iin'))) {
      map.bin = index;
    }
    if (
      map.account === undefined &&
      (lower.includes('счет') ||
        lower.includes('счёт') ||
        lower.includes('account') ||
        lower.includes('iban') ||
        lower.includes('iik') ||
        lower.includes('иик'))
    ) {
      map.account = index;
    }
    if (
      map.bank === undefined &&
      (lower.includes('банк') || lower.includes('bic') || lower.includes('бик'))
    ) {
      map.bank = index;
    }
    if (map.debit === undefined && (lower.includes('дебет') || lower.includes('debit'))) {
      map.debit = index;
    }
    if (map.credit === undefined && (lower.includes('кредит') || lower.includes('credit'))) {
      map.credit = index;
    }
    if (
      map.purpose === undefined &&
      (lower.includes('назнач') || lower.includes('основан') || lower.includes('purpose'))
    ) {
      map.purpose = index;
    }
    if (map.knp === undefined && (lower.includes('кнп') || lower.includes('knp'))) {
      map.knp = index;
    }
    if (
      map.currency === undefined &&
      (lower.includes('валют') ||
        lower === 'usd' ||
        lower === 'eur' ||
        lower === 'kzt' ||
        lower === 'rub')
    ) {
      map.currency = index;
    }
  });

  return map;
}

function pickDateValue(row: string[], columnMap: Partial<Record<TableColumnKey, number>>): string | null {
  if (columnMap.date !== undefined) {
    const value = row[columnMap.date];
    if (value && DATE_REGEX.test(value)) {
      return value;
    }
  }

  const fallback = row.find((cell) => DATE_REGEX.test(cell));
  return fallback || null;
}

function buildTransactionFromRow(
  row: string[],
  transactionDate: Date,
  columnMap: Partial<Record<TableColumnKey, number>>,
  options?: TableParsingOptions,
): ParsedTransaction {
  const debit =
    columnMap.debit !== undefined ? normalizeNumber(row[columnMap.debit]) ?? undefined : undefined;
  const credit =
    columnMap.credit !== undefined
      ? normalizeNumber(row[columnMap.credit]) ?? undefined
      : undefined;

  const documentNumber = valueAt(row, columnMap.document) || extractDocument(row);
  const bin = valueAt(row, columnMap.bin) || extractBin(row);
  const account = valueAt(row, columnMap.account) || extractAccount(row);
  const bank = valueAt(row, columnMap.bank) || extractBank(row);
  const knp = valueAt(row, columnMap.knp);
  const currency = detectCurrency(row, columnMap) || options?.defaultCurrency || 'KZT';

  const counterpartyName =
    valueAt(row, columnMap.counterparty) ||
    collectName(row, columnMap) ||
    'Неизвестный контрагент';

  const purpose =
    valueAt(row, columnMap.purpose) || collectPurpose(row, columnMap) || 'Не указано';

  return {
    transactionDate,
    documentNumber,
    counterpartyName: counterpartyName.trim(),
    counterpartyBin: bin,
    counterpartyAccount: account,
    counterpartyBank: bank,
    debit,
    credit,
    paymentPurpose: [purpose.trim(), knp ? `КНП ${knp}` : ''].filter(Boolean).join(' ').trim(),
    currency,
  };
}

function collectContinuation(
  row: string[],
  columnMap: Partial<Record<TableColumnKey, number>>,
): string {
  const excludedIndexes = new Set<number>();
  ['date', 'document', 'debit', 'credit', 'purpose'].forEach((key) => {
    const columnKey = key as TableColumnKey;
    const idx = columnMap[columnKey];
    if (idx !== undefined) {
      excludedIndexes.add(idx);
    }
  });

  const parts = row
    .map((cell, idx) => ({ cell, idx }))
    .filter(({ idx, cell }) => !excludedIndexes.has(idx) && cell)
    .map(({ cell }) => cell);

  return parts.join(' ').trim();
}

function collectPurpose(
  row: string[],
  columnMap: Partial<Record<TableColumnKey, number>>,
): string {
  const used = new Set<number>();
  ['date', 'document', 'counterparty', 'bin', 'account', 'bank', 'debit', 'credit', 'knp'].forEach(
    (key) => {
      const columnKey = key as TableColumnKey;
      const idx = columnMap[columnKey];
      if (idx !== undefined) {
        used.add(idx);
      }
    },
  );

  const parts = row
    .map((cell, idx) => ({ cell, idx }))
    .filter(({ idx, cell }) => !used.has(idx) && !isAmount(cell) && !DATE_REGEX.test(cell))
    .map(({ cell }) => cell);

  return parts.join(' ').trim();
}

function collectName(
  row: string[],
  columnMap: Partial<Record<TableColumnKey, number>>,
): string | null {
  const excludedIndexes = new Set<number>();
  ['date', 'document', 'debit', 'credit', 'purpose'].forEach((key) => {
    const columnKey = key as TableColumnKey;
    const idx = columnMap[columnKey];
    if (idx !== undefined) {
      excludedIndexes.add(idx);
    }
  });

  for (let i = 0; i < row.length; i++) {
    if (excludedIndexes.has(i)) continue;
    const cell = row[i];
    if (!cell || isAmount(cell) || DATE_REGEX.test(cell)) {
      continue;
    }
    if (cell.length > 2) {
      return cell;
    }
  }
  return null;
}

function valueAt(row: string[], index?: number): string | undefined {
  if (index === undefined) {
    return undefined;
  }
  return row[index];
}

function extractDocument(row: string[]): string | undefined {
  for (const cell of row) {
    const match = cell.match(/\b\d{5,}\b/);
    if (match) {
      return match[0];
    }
  }
  return undefined;
}

function extractBin(row: string[]): string | undefined {
  const text = row.join(' ');
  const match = text.match(/\b\d{11,12}\b/);
  return match ? match[0] : undefined;
}

function extractAccount(row: string[]): string | undefined {
  const text = row.join(' ');
  const match = text.match(/KZ\d{10,}|[A-Z0-9]{20,}/i);
  return match ? match[0].toUpperCase() : undefined;
}

function extractBank(row: string[]): string | undefined {
  const text = row.join(' ');
  const match = text.match(/[A-Z]{6}[A-Z0-9]{2,5}/);
  return match ? match[0] : undefined;
}

function detectCurrency(
  row: string[],
  columnMap: Partial<Record<TableColumnKey, number>>,
): string | undefined {
  if (columnMap.currency !== undefined) {
    const value = row[columnMap.currency];
    if (value) {
      return value.toUpperCase();
    }
  }

  const text = row.join(' ').toUpperCase();
  const match = text.match(/\b(USD|EUR|KZT|RUB)\b/);
  return match ? match[1] : undefined;
}

function isAmount(value: string): boolean {
  const num = normalizeNumber(value);
  return typeof num === 'number';
}
