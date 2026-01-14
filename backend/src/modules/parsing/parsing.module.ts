import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParsingRule } from '../../entities/parsing-rule.entity';
import { Statement } from '../../entities/statement.entity';
import { Transaction } from '../../entities/transaction.entity';
import { ClassificationModule } from '../classification/classification.module';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';
import { ParserFactoryService } from './services/parser-factory.service';
import { ParsingRulesService } from './services/parsing-rules.service';
import { StatementProcessingService } from './services/statement-processing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Statement, Transaction, ParsingRule]),
    ClassificationModule,
    forwardRef(() => GoogleSheetsModule),
  ],
  providers: [ParserFactoryService, StatementProcessingService, ParsingRulesService],
  exports: [ParserFactoryService, StatementProcessingService, ParsingRulesService],
})
export class ParsingModule {}
