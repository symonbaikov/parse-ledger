import { IParser } from '../interfaces/parser.interface';
import { ParsedStatement } from '../interfaces/parsed-statement.interface';
import { BankName, FileType } from '../../../entities/statement.entity';
import { normalizeNumber, normalizeDate } from '../../../common/utils/number-normalizer.util';

export abstract class BaseParser implements IParser {
  abstract canParse(
    bankName: BankName,
    fileType: FileType,
    filePath: string,
  ): Promise<boolean>;

  abstract parse(filePath: string): Promise<ParsedStatement>;

  protected normalizeNumberValue(value: string | number | null | undefined): number | null {
    return normalizeNumber(value);
  }

  protected normalizeDate(dateStr: string): Date | null {
    return normalizeDate(dateStr);
  }

  protected extractAccountNumber(text: string): string | null {
    // Look for account numbers in format KZXXXXXXXXXXXXX
    const accountRegex = /KZ\d{13,20}/gi;
    const match = text.match(accountRegex);
    return match ? match[0] : null;
  }

  protected extractDateRange(text: string): { from: Date | null; to: Date | null } {
    // Look for date ranges like "01.01.2024 - 31.01.2024"
    const dateRangeRegex = /(\d{2}\.\d{2}\.\d{4})\s*[-–—]\s*(\d{2}\.\d{2}\.\d{4})/gi;
    const match = text.match(dateRangeRegex);
    
    if (match) {
      const dates = match[0].split(/[-–—]/).map((d) => d.trim());
      return {
        from: this.normalizeDate(dates[0]),
        to: this.normalizeDate(dates[1]),
      };
    }

    return { from: null, to: null };
  }

  protected extractBalance(text: string, label: string): number | null {
    // Look for balance values after labels like "Остаток на начало:" or "Остаток на конец:"
    const regex = new RegExp(`${label}[\\s:]*([\\d\\s,.-]+)`, 'gi');
    const match = text.match(regex);
    if (match) {
      return this.normalizeNumberValue(match[0].replace(label, '').trim());
    }
    return null;
  }
}

