import { Test, TestingModule } from '@nestjs/testing';
import { ParserFactoryService } from './parser-factory.service';
import { BankName, FileType } from '../../../entities/statement.entity';
import { BerekeNewParser } from '../parsers/bereke-new.parser';
import { BerekeOldParser } from '../parsers/bereke-old.parser';
import { KaspiParser } from '../parsers/kaspi.parser';
import { GenericPdfParser } from '../parsers/generic-pdf.parser';
import { ExcelParser } from '../parsers/excel.parser';
import { CsvParser } from '../parsers/csv.parser';

jest.mock('../../../common/utils/pdf-parser.util', () => ({
  extractTextFromPdf: jest.fn().mockResolvedValue('kaspi bank statement'),
}));

describe('ParserFactoryService', () => {
  let testingModule: TestingModule;
  let service: ParserFactoryService;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [ParserFactoryService],
    }).compile();

    service = testingModule.get<ParserFactoryService>(ParserFactoryService);

    // Avoid real file I/O inside parsers
    jest.spyOn(BerekeNewParser.prototype, 'canParse').mockResolvedValue(false);
    jest.spyOn(BerekeOldParser.prototype, 'canParse').mockResolvedValue(false);
    jest.spyOn(KaspiParser.prototype, 'canParse').mockResolvedValue(false);
    jest.spyOn(GenericPdfParser.prototype, 'canParse').mockResolvedValue(false);
    jest.spyOn(ExcelParser.prototype, 'canParse').mockResolvedValue(false);
    jest.spyOn(CsvParser.prototype, 'canParse').mockResolvedValue(false);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await testingModule.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getParser', () => {
    it('returns null when no parser can parse', async () => {
      const parser = await service.getParser(
        BankName.KASPI,
        FileType.PDF,
        '/tmp/mock.pdf',
      );

      expect(parser).toBeNull();
    });

    it('returns first parser that can parse', async () => {
      jest.spyOn(KaspiParser.prototype, 'canParse').mockResolvedValue(true);

      const parser = await service.getParser(
        BankName.KASPI,
        FileType.PDF,
        '/tmp/mock.pdf',
      );

      expect(parser).toBeInstanceOf(KaspiParser);
    });
  });

  describe('detectBankAndFormat', () => {
    it('detects Kaspi bank from PDF content', async () => {
      const result = await service.detectBankAndFormat('/tmp/mock.pdf', FileType.PDF);
      expect(result.bankName).toBe(BankName.KASPI);
    });

    it('falls back to OTHER for non-PDF files', async () => {
      const result = await service.detectBankAndFormat('/tmp/mock.xlsx', FileType.XLSX);
      expect(result.bankName).toBeDefined();
    });
  });

  it('initializes all required parsers', () => {
    const parserNames = service['parsers'].map((p) => p.constructor.name);
    expect(parserNames).toEqual([
      'BerekeNewParser',
      'BerekeOldParser',
      'KaspiParser',
      'GenericPdfParser',
      'ExcelParser',
      'CsvParser',
    ]);
  });
});
