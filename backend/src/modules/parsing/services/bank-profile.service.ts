import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { Injectable, Logger } from '@nestjs/common';

export interface BankProfile {
  id: string;
  name: string;
  displayName: string;
  country: string;
  locale: string;
  currency: string;
  version: string;
  lastUpdated: string;

  // Identification patterns
  identification: {
    documentPatterns: string[];
    filenamePatterns: string[];
    textPatterns: string[];
    urlPatterns?: string[];
    metadataPatterns?: string[];
  };

  // Parsing configuration
  parsing: {
    format: 'csv' | 'excel' | 'pdf' | 'html' | 'auto';
    encoding?: string;
    delimiter?: string;
    hasHeader?: boolean;
    skipRows?: number;
    maxRows?: number;

    // Column configuration
    columns: ColumnDefinition[];

    // Date and amount parsing
    dateFormat?: string;
    amountFormat?: {
      decimalSeparator: string;
      thousandsSeparator: string;
      currencyPosition: 'before' | 'after';
      currencySymbol?: string;
    };

    // Special handling
    multiCurrency?: boolean;
    reverseDebitCredit?: boolean;
    negativeInParentheses?: boolean;
    zeroAmountsAsNull?: boolean;
  };

  // Metadata extraction
  metadata: {
    headerPatterns?: string[];
    accountNumberPatterns?: string[];
    periodPatterns?: string[];
    balancePatterns?: string[];
    currencyPatterns?: string[];
    institutionPatterns?: string[];
  };

  // Validation rules
  validation: {
    requiredFields?: string[];
    optionalFields?: string[];
    fieldValidation?: FieldValidation[];
    businessRules?: BusinessRule[];
  };

  // Quality control
  quality: {
    expectedColumns?: number;
    toleranceLevels?: {
      amount: number; // Percentage
      date: number; // Days
      balance: number; // Percentage
    };
    checksumValidation?: boolean;
    duplicateDetection?: boolean;
  };

  // Feature flags
  features: {
    useMLClassification?: boolean;
    useAdvancedExtraction?: boolean;
    useAutoFix?: boolean;
    useChecksumValidation?: boolean;
    fallbackMode?: string;
  };
}

export interface ColumnDefinition {
  name: string;
  type: 'date' | 'amount' | 'string' | 'number' | 'currency' | 'boolean';
  required: boolean;
  index?: number;
  pattern?: string;
  mapping?: {
    alternatives?: string[];
    transformations?: string[];
  };
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedValues?: string[];
  };
}

export interface FieldValidation {
  field: string;
  type: 'format' | 'range' | 'pattern' | 'enum';
  rule: string;
  message?: string;
  severity?: 'error' | 'warning';
}

export interface BusinessRule {
  name: string;
  description: string;
  condition: string;
  action: string;
  priority: number;
}

@Injectable()
export class BankProfileService {
  private readonly logger = new Logger(BankProfileService.name);
  private readonly profiles = new Map<string, BankProfile>();
  private readonly profileDirectory = 'config/bank-profiles';

  constructor() {
    this.loadProfiles();
  }

  private async loadProfiles(): Promise<void> {
    try {
      const profilePath = resolve(process.cwd(), this.profileDirectory);

      if (!existsSync(profilePath)) {
        this.logger.warn(`Bank profile directory not found: ${profilePath}`);
        this.createDefaultProfiles();
        return;
      }

      const files = readdirSync(profilePath);

      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml')) {
          const filePath = join(profilePath, file);
          const profile = await this.loadProfileFile(filePath);

          if (profile) {
            this.profiles.set(profile.id, profile);
            this.logger.log(`Loaded bank profile: ${profile.name} (${profile.id})`);
          }
        }
      }

      this.logger.log(`Loaded ${this.profiles.size} bank profiles`);
    } catch (error) {
      this.logger.error('Failed to load bank profiles', error);
      this.createDefaultProfiles();
    }
  }

  private async loadProfileFile(filePath: string): Promise<BankProfile | null> {
    try {
      const content = readFileSync(filePath, 'utf8');
      const isYaml = filePath.endsWith('.yaml') || filePath.endsWith('.yml');

      if (isYaml) {
        // Use yaml parser (would need to install yaml package)
        // const yaml = require('yaml');
        // return yaml.parse(content) as BankProfile;
        this.logger.warn('YAML support requires yaml package, skipping YAML files');
        return null;
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to load profile from ${filePath}: ${error.message}`);
      return null;
    }
  }

  private createDefaultProfiles(): void {
    const defaultProfiles: BankProfile[] = [
      this.createKazkomertsbankProfile(),
      this.createHalykBankProfile(),
      this.createKaspiBankProfile(),
      this.createBerekeBankProfile(),
    ];

    defaultProfiles.forEach(profile => {
      this.profiles.set(profile.id, profile);
      this.logger.log(`Created default profile: ${profile.name} (${profile.id})`);
    });
  }

  private createKazkomertsbankProfile(): BankProfile {
    return {
      id: 'kazkomertsbank',
      name: 'Kazkommertsbank',
      displayName: 'АО "Казкоммерцбанк"',
      country: 'KZ',
      locale: 'ru',
      currency: 'KZT',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),

      identification: {
        documentPatterns: ['казкоммерцбанк', 'kazkomertsbank', 'kkb', 'АО "Казкоммерцбанк"'],
        filenamePatterns: ['kkb_.*\\.pdf', 'kazkomertsbank_.*\\.xlsx', 'выписка_.*kkb.*'],
        textPatterns: ['АО "Казкоммерцбанк"', 'Казкоммерцбанк', 'KAZKOMERTSBANK'],
      },

      parsing: {
        format: 'pdf',
        columns: [
          { name: 'transactionDate', type: 'date', required: true, index: 0 },
          { name: 'documentNumber', type: 'string', required: false, index: 1 },
          {
            name: 'counterpartyName',
            type: 'string',
            required: true,
            index: 2,
          },
          {
            name: 'counterpartyBin',
            type: 'string',
            required: false,
            index: 3,
          },
          { name: 'debit', type: 'amount', required: false, index: 4 },
          { name: 'credit', type: 'amount', required: false, index: 5 },
          { name: 'paymentPurpose', type: 'string', required: true, index: 6 },
          { name: 'currency', type: 'currency', required: false, index: 7 },
        ],
        dateFormat: 'DD.MM.YYYY',
        amountFormat: {
          decimalSeparator: ',',
          thousandsSeparator: ' ',
          currencyPosition: 'after',
          currencySymbol: '₸',
        },
        reverseDebitCredit: false,
        negativeInParentheses: false,
      },

      metadata: {
        headerPatterns: ['ВЫПИСКА ИЗ СЧЕТА', 'ПО СЧЕТУ', 'АО "Казкоммерцбанк"'],
        accountNumberPatterns: ['Счет[:\\s]*([A-Z0-9]{20})', 'Номер счета[:\\s]*([A-Z0-9]{20})'],
        periodPatterns: [
          'Период[:\\s]*(\\d{2}\\.\\d{2}\\.\\d{4})\\s*-\\s*(\\d{2}\\.\\d{2}\\.\\d{4})',
          'За период[:\\s]*(\\d{2}\\.\\d{2}\\.\\d{4})\\s*по\\s*(\\d{2}\\.\\d{2}\\.\\d{4})',
        ],
        balancePatterns: [
          'Остаток на конец[:\\s]*([\\d\\s,.-]+)',
          'Конечный остаток[:\\s]*([\\d\\s,.-]+)',
        ],
      },

      validation: {
        requiredFields: ['transactionDate', 'counterpartyName', 'paymentPurpose'],
        optionalFields: ['documentNumber', 'counterpartyBin', 'currency'],
        businessRules: [
          {
            name: 'debit_xor_credit',
            description: 'Transaction must have either debit or credit, not both',
            condition: 'xor(debit, credit)',
            action: 'set_other_to_zero',
            priority: 1,
          },
        ],
      },

      quality: {
        expectedColumns: 8,
        toleranceLevels: {
          amount: 0.01, // 1%
          date: 1, // 1 day
          balance: 0.02, // 2%
        },
        checksumValidation: true,
        duplicateDetection: true,
      },

      features: {
        useMLClassification: true,
        useAdvancedExtraction: true,
        useAutoFix: true,
        useChecksumValidation: true,
        fallbackMode: 'regex',
      },
    };
  }

  private createHalykBankProfile(): BankProfile {
    return {
      id: 'halykbank',
      name: 'Halyk Bank',
      displayName: 'АО "Народный банк Казахстана"',
      country: 'KZ',
      locale: 'ru',
      currency: 'KZT',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),

      identification: {
        documentPatterns: ['народный банк', 'halyk bank', 'халык банк', 'народный'],
        filenamePatterns: ['halyk_.*\\.pdf', 'народный_.*\\.xlsx'],
        textPatterns: ['АО "Народный банк Казахстана"', 'Halyk Bank', 'Халык Банк'],
      },

      parsing: {
        format: 'excel',
        delimiter: ',',
        hasHeader: true,
        skipRows: 1,
        columns: [
          { name: 'transactionDate', type: 'date', required: true, index: 0 },
          {
            name: 'counterpartyName',
            type: 'string',
            required: true,
            index: 1,
          },
          { name: 'paymentPurpose', type: 'string', required: true, index: 2 },
          { name: 'debit', type: 'amount', required: false, index: 3 },
          { name: 'credit', type: 'amount', required: false, index: 4 },
          { name: 'currency', type: 'currency', required: false, index: 5 },
        ],
        dateFormat: 'DD.MM.YYYY',
        amountFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          currencyPosition: 'after',
          currencySymbol: '₸',
        },
      },

      metadata: {
        headerPatterns: ['Народный банк', 'Halyk Bank', 'Выписка по счету'],
        accountNumberPatterns: ['Счет[:\\s]*([A-Z0-9]{20})', 'Номер счета[:\\s]*([A-Z0-9]{20})'],
        periodPatterns: [
          'Период[:\\s]*(\\d{2}\\.\\d{2}\\.\\d{4})\\s*-\\s*(\\d{2}\\.\\d{2}\\.\\d{4})',
        ],
      },

      validation: {
        requiredFields: ['transactionDate', 'counterpartyName', 'paymentPurpose'],
        businessRules: [
          {
            name: 'amount_required',
            description: 'Transaction must have either debit or credit',
            condition: 'or(debit, credit)',
            action: 'error_if_missing',
            priority: 1,
          },
        ],
      },

      quality: {
        expectedColumns: 6,
        toleranceLevels: {
          amount: 0.01,
          date: 1,
          balance: 0.02,
        },
        checksumValidation: true,
        duplicateDetection: true,
      },

      features: {
        useMLClassification: true,
        useAdvancedExtraction: true,
        useAutoFix: true,
        useChecksumValidation: true,
        fallbackMode: 'heuristic',
      },
    };
  }

  private createKaspiBankProfile(): BankProfile {
    return {
      id: 'kaspibank',
      name: 'Kaspi Bank',
      displayName: 'АО "Kaspi Bank"',
      country: 'KZ',
      locale: 'ru',
      currency: 'KZT',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),

      identification: {
        documentPatterns: ['каспи банк', 'kaspi bank', 'каспи', 'kaspi'],
        filenamePatterns: ['kaspi_.*\\.pdf', 'каспи_.*\\.xlsx', 'выписка_.*kaspi.*'],
        textPatterns: ['АО Kaspi Bank', 'Kaspi Bank', 'Каспи Банк'],
      },

      parsing: {
        format: 'csv',
        delimiter: ';',
        hasHeader: true,
        columns: [
          { name: 'transactionDate', type: 'date', required: true, index: 0 },
          { name: 'documentNumber', type: 'string', required: false, index: 1 },
          {
            name: 'counterpartyName',
            type: 'string',
            required: true,
            index: 2,
          },
          { name: 'debit', type: 'amount', required: false, index: 3 },
          { name: 'credit', type: 'amount', required: false, index: 4 },
          { name: 'paymentPurpose', type: 'string', required: true, index: 5 },
        ],
        dateFormat: 'DD.MM.YYYY HH:mm:ss',
        amountFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ' ',
          currencyPosition: 'after',
        },
        reverseDebitCredit: false,
      },

      metadata: {
        headerPatterns: ['Kaspi Bank', 'АО Kaspi Bank', 'Выписка по счету'],
      },

      validation: {
        requiredFields: ['transactionDate', 'counterpartyName', 'paymentPurpose'],
      },

      quality: {
        expectedColumns: 6,
        toleranceLevels: {
          amount: 0.01,
          date: 1,
          balance: 0.02,
        },
        checksumValidation: true,
        duplicateDetection: true,
      },

      features: {
        useMLClassification: false,
        useAdvancedExtraction: true,
        useAutoFix: true,
        useChecksumValidation: true,
        fallbackMode: 'regex',
      },
    };
  }

  private createBerekeBankProfile(): BankProfile {
    return {
      id: 'berekebank',
      name: 'Bereke Bank',
      displayName: 'АО "Bereke Bank"',
      country: 'KZ',
      locale: 'ru',
      currency: 'KZT',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),

      identification: {
        documentPatterns: ['береке банк', 'bereke bank', 'береке', 'bereke'],
        filenamePatterns: ['bereke_.*\\.pdf', 'береке_.*\\.xlsx'],
        textPatterns: ['АО Bereke Bank', 'Bereke Bank', 'Береке Банк'],
      },

      parsing: {
        format: 'pdf',
        columns: [
          { name: 'transactionDate', type: 'date', required: true, index: 0 },
          {
            name: 'counterpartyName',
            type: 'string',
            required: true,
            index: 1,
          },
          { name: 'paymentPurpose', type: 'string', required: true, index: 2 },
          { name: 'debit', type: 'amount', required: false, index: 3 },
          { name: 'credit', type: 'amount', required: false, index: 4 },
          { name: 'currency', type: 'currency', required: false, index: 5 },
        ],
        dateFormat: 'DD.MM.YYYY',
        amountFormat: {
          decimalSeparator: ',',
          thousandsSeparator: ' ',
          currencyPosition: 'after',
          currencySymbol: '₸',
        },
      },

      metadata: {
        headerPatterns: ['Bereke Bank', 'АО Bereke Bank', 'Выписка по счету'],
      },

      validation: {
        requiredFields: ['transactionDate', 'counterpartyName', 'paymentPurpose'],
      },

      quality: {
        expectedColumns: 6,
        toleranceLevels: {
          amount: 0.01,
          date: 1,
          balance: 0.02,
        },
        checksumValidation: true,
        duplicateDetection: true,
      },

      features: {
        useMLClassification: false,
        useAdvancedExtraction: true,
        useAutoFix: true,
        useChecksumValidation: true,
        fallbackMode: 'heuristic',
      },
    };
  }

  // Public methods

  getProfile(id: string): BankProfile | undefined {
    return this.profiles.get(id);
  }

  getAllProfiles(): BankProfile[] {
    return Array.from(this.profiles.values());
  }

  findProfileByFileName(fileName: string): BankProfile | undefined {
    const normalizedName = fileName.toLowerCase();

    for (const profile of this.profiles.values()) {
      for (const pattern of profile.identification.filenamePatterns) {
        if (new RegExp(pattern, 'i').test(normalizedName)) {
          return profile;
        }
      }
    }

    return undefined;
  }

  findProfileByText(text: string): BankProfile | undefined {
    const normalizedText = text.toLowerCase();

    for (const profile of this.profiles.values()) {
      for (const pattern of profile.identification.textPatterns) {
        if (normalizedText.includes(pattern.toLowerCase())) {
          return profile;
        }
      }
    }

    return undefined;
  }

  findProfileByContent(content: string): BankProfile | undefined {
    // Try filename patterns first (if available)
    // Then text patterns
    return this.findProfileByText(content);
  }

  addProfile(profile: BankProfile): void {
    this.profiles.set(profile.id, profile);
    this.logger.log(`Added bank profile: ${profile.name} (${profile.id})`);
  }

  updateProfile(id: string, updates: Partial<BankProfile>): void {
    const existing = this.profiles.get(id);
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      this.profiles.set(id, updated);
      this.logger.log(`Updated bank profile: ${updated.name} (${id})`);
    }
  }

  removeProfile(id: string): boolean {
    const removed = this.profiles.delete(id);
    if (removed) {
      this.logger.log(`Removed bank profile: ${id}`);
    }
    return removed;
  }

  reloadProfiles(): void {
    this.profiles.clear();
    this.loadProfiles();
  }

  // Profile validation
  validateProfile(profile: BankProfile): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!profile.id) {
      errors.push('Profile ID is required');
    }

    if (!profile.name) {
      errors.push('Profile name is required');
    }

    if (!profile.country || profile.country.length !== 2) {
      errors.push('Valid country code is required');
    }

    if (!profile.currency || profile.currency.length !== 3) {
      errors.push('Valid currency code is required');
    }

    if (!profile.parsing.columns || profile.parsing.columns.length === 0) {
      errors.push('At least one column definition is required');
    }

    const hasDateColumn = profile.parsing.columns.some(col => col.type === 'date');
    if (!hasDateColumn) {
      errors.push('At least one date column is required');
    }

    const hasAmountColumn = profile.parsing.columns.some(col => col.type === 'amount');
    if (!hasAmountColumn) {
      errors.push('At least one amount column is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Profile export/import
  exportProfile(id: string, format: 'json' | 'yaml' = 'json'): string | null {
    const profile = this.getProfile(id);
    if (!profile) {
      return null;
    }

    if (format === 'json') {
      return JSON.stringify(profile, null, 2);
    }

    if (format === 'yaml') {
      // const yaml = require('yaml');
      // return yaml.stringify(profile);
      this.logger.warn('YAML export requires yaml package');
      return JSON.stringify(profile, null, 2);
    }

    return null;
  }

  importProfile(
    content: string,
    format: 'json' | 'yaml' = 'json',
  ): { success: boolean; profile?: BankProfile; error?: string } {
    try {
      let profile: BankProfile;

      if (format === 'json') {
        profile = JSON.parse(content) as BankProfile;
      }

      if (format === 'yaml') {
        // const yaml = require('yaml');
        // profile = yaml.parse(content);
        this.logger.warn('YAML import requires yaml package');
        return {
          success: false,
          error: 'YAML format not supported without yaml package',
        };
      }

      const validation = this.validateProfile(profile);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      this.addProfile(profile);
      return { success: true, profile };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
