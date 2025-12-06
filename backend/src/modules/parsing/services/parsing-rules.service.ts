import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParsingRule } from '../../../entities/parsing-rule.entity';
import { BankName } from '../../../entities/statement.entity';

@Injectable()
export class ParsingRulesService {
  constructor(
    @InjectRepository(ParsingRule)
    private parsingRuleRepository: Repository<ParsingRule>,
  ) {}

  async getRule(bankName: BankName, formatVersion?: string): Promise<ParsingRule | null> {
    return this.parsingRuleRepository.findOne({
      where: {
        bankName,
        formatVersion: formatVersion || '',
        isActive: true,
      },
    });
  }

  async createRule(rule: Partial<ParsingRule>): Promise<ParsingRule> {
    const parsingRule = this.parsingRuleRepository.create(rule);
    return this.parsingRuleRepository.save(parsingRule);
  }

  async updateRule(id: string, updates: Partial<ParsingRule>): Promise<ParsingRule> {
    const rule = await this.parsingRuleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new Error('Parsing rule not found');
    }

    Object.assign(rule, updates);
    return this.parsingRuleRepository.save(rule);
  }

  async getAllRules(): Promise<ParsingRule[]> {
    return this.parsingRuleRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }
}








