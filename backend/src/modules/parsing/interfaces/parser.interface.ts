import { ParsedStatement } from './parsed-statement.interface';
import { BankName, FileType } from '../../../entities/statement.entity';

export interface IParser {
  canParse(bankName: BankName, fileType: FileType, filePath: string): Promise<boolean>;
  parse(filePath: string): Promise<ParsedStatement>;
}








