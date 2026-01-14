cd backend
❯ npm test

> backend@1.0.0 test
> npm run test:unit


> backend@1.0.0 test:unit
> jest --config jest.unit.config.ts

 PASS   unit  @tests/unit/modules/transactions/transactions.service.spec.ts
  ● Console

    console.error
      Error updating transaction 2: NotFoundException: Transaction not found
          at TransactionsService.findOne (/Users/symonbaikov/finflow/parse-ledger/backend/src/modules/transactions/transactions.service.ts:111:13)
          at processTicksAndRejections (node:internal/process/task_queues:95:5)
          at TransactionsService.update (/Users/symonbaikov/finflow/parse-ledger/backend/src/modules/transactions/transactions.service.ts:128:25)
          at TransactionsService.bulkUpdate (/Users/symonbaikov/finflow/parse-ledger/backend/src/modules/transactions/transactions.service.ts:164:29)
          at Object.<anonymous> (/Users/symonbaikov/finflow/parse-ledger/backend/@tests/unit/modules/transactions/transactions.service.spec.ts:356:22) {
        response: {
          message: 'Transaction not found',
          error: 'Not Found',
          statusCode: 404
        },
        status: 404,
        options: {}
      }

      165 |         updatedTransactions.push(transaction);
      166 |       } catch (error) {
    > 167 |         console.error(`Error updating transaction ${item.id}:`, error);
          |                 ^
      168 |       }
      169 |     }
      170 |

      at TransactionsService.error [as bulkUpdate] (src/modules/transactions/transactions.service.ts:167:17)
      at Object.<anonymous> (@tests/unit/modules/transactions/transactions.service.spec.ts:356:22)

 PASS   unit  @tests/unit/modules/auth/auth.service.spec.ts
 PASS   unit  @tests/unit/modules/workspaces/workspaces.service.spec.ts
 PASS   unit  @tests/unit/modules/categories/categories.service.spec.ts
 PASS   unit  @tests/unit/modules/wallets/wallets.service.spec.ts
 PASS   unit  @tests/unit/modules/branches/branches.service.spec.ts
 PASS   unit  @tests/unit/modules/users/users.service.spec.ts
 FAIL   unit  @tests/unit/test/statement-processing.service.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/modules/parsing/services/statement-processing.service' from '@tests/unit/test/statement-processing.service.spec.ts'

    > 1 | import { StatementProcessingService } from '../src/modules/parsing/services/statement-processing.service';
        | ^
      2 | import { Statement, StatementStatus, FileType, BankName } from '../src/entities/statement.entity';
      3 | import { Transaction } from '../src/entities/transaction.entity';
      4 | import { ParsedStatement } from '../src/modules/parsing/interfaces/parsed-statement.interface';

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/statement-processing.service.spec.ts:1:1)
 PASS   unit  @tests/unit/modules/classification/services/classification.service.spec.ts
 PASS   unit  @tests/unit/modules/storage/storage.service.spec.ts
 FAIL   unit  @tests/unit/test/classification.service.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/modules/classification/services/classification.service' from '@tests/unit/test/classification.service.spec.ts'

    > 1 | import { ClassificationService } from '../src/modules/classification/services/classification.service';
        | ^
      2 | import { Transaction, TransactionType } from '../src/entities/transaction.entity';
      3 | import { Category, CategoryType } from '../src/entities/category.entity';
      4 | import { Branch } from '../src/entities/branch.entity';

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/classification.service.spec.ts:1:1)

 PASS   unit  @tests/unit/modules/auth/strategies/jwt.strategy.spec.ts
 FAIL   unit  @tests/unit/modules/auth/guards/jwt-refresh.guard.spec.ts
  ● Test suite failed to run

    Configuration error:

    Could not locate module @/common/guards/jwt-refresh.guard mapped as:
    /Users/symonbaikov/finflow/parse-ledger/backend/src/$1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^@\/(.*)$/": "/Users/symonbaikov/finflow/parse-ledger/backend/src/$1"
      },
      "resolver": undefined
    }

      1 | import { Test, TestingModule } from '@nestjs/testing';
    > 2 | import { JwtRefreshGuard } from '@/common/guards/jwt-refresh.guard';
        | ^
      3 | import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
      4 | import { AuthGuard } from '@nestjs/passport';
      5 |

      at createNoMappedModuleFoundError (node_modules/jest-resolve/build/index.js:1117:17)
      at Object.require (@tests/unit/modules/auth/guards/jwt-refresh.guard.spec.ts:2:1)

 FAIL   unit  @tests/unit/test/statements.service.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/common/utils/file-hash.util' from '@tests/unit/test/statements.service.spec.ts'

      3 | import * as fs from 'fs';
      4 |
    > 5 | jest.mock('../src/common/utils/file-hash.util', () => ({
        |      ^
      6 |   calculateFileHash: jest.fn(),
      7 | }));
      8 |

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.mock (@tests/unit/test/statements.service.spec.ts:5:6)

 PASS   unit  @tests/unit/modules/auth/guards/jwt-auth.guard.spec.ts
 FAIL   unit  @tests/unit/test/pdf-parser.util.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/common/utils/pdf-parser.util' from '@tests/unit/test/pdf-parser.util.spec.ts'

      4 | import { spawnSync } from 'child_process';
      5 | import { PDFDocument, StandardFonts } from 'pdf-lib';
    > 6 | import {
        | ^
      7 |   extractTablesFromPdf,
      8 |   extractTextAndLayoutFromPdf,
      9 | } from '../src/common/utils/pdf-parser.util';

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/pdf-parser.util.spec.ts:6:1)

 FAIL   unit  @tests/unit/test/async.util.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/common/utils/async.util' from '@tests/unit/test/async.util.spec.ts'

    > 1 | import { retry, sleep, TimeoutError, withTimeout } from '../src/common/utils/async.util';
        | ^
      2 |
      3 | describe('async.util', () => {
      4 |   it('withTimeout returns result when completed on time', async () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/async.util.spec.ts:1:1)

 FAIL   unit  @tests/unit/test/filename.util.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/common/utils/filename.util' from '@tests/unit/test/filename.util.spec.ts'

    > 1 | import { normalizeFilename } from '../src/common/utils/filename.util';
        | ^
      2 |
      3 | describe('normalizeFilename', () => {
      4 |   it('decodes UTF-8->latin1 mojibake for Cyrillic filenames', () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/filename.util.spec.ts:1:1)

 FAIL   unit  @tests/unit/test/semaphore.util.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/common/utils/semaphore.util' from '@tests/unit/test/semaphore.util.spec.ts'

    > 1 | import { Semaphore } from '../src/common/utils/semaphore.util';
        | ^
      2 | import { sleep } from '../src/common/utils/async.util';
      3 |
      4 | describe('Semaphore', () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/semaphore.util.spec.ts:1:1)

 PASS   unit  @tests/unit/modules/parsing/services/parser-factory.service.spec.ts
  ● Console

    console.log
      [ParserFactory] Looking for parser for bank: kaspi, fileType: pdf

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:32:13)

    console.log
      [ParserFactory] Trying parser: BerekeNewParser

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:35:15)

    console.log
      [ParserFactory] Parser BerekeNewParser cannot parse this file

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:40:17)

    console.log
      [ParserFactory] Trying parser: BerekeOldParser

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:35:15)

    console.log
      [ParserFactory] Parser BerekeOldParser cannot parse this file

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:40:17)

    console.log
      [ParserFactory] Trying parser: KaspiParser

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:35:15)

    console.log
      [ParserFactory] Parser KaspiParser cannot parse this file

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:40:17)

    console.log
      [ParserFactory] Trying parser: GenericPdfParser

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:35:15)

    console.log
      [ParserFactory] Parser GenericPdfParser cannot parse this file

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:40:17)

    console.log
      [ParserFactory] Trying parser: ExcelParser

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:35:15)

    console.log
      [ParserFactory] Parser ExcelParser cannot parse this file

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:40:17)

    console.log
      [ParserFactory] Trying parser: CsvParser

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:35:15)

    console.log
      [ParserFactory] Parser CsvParser cannot parse this file

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:40:17)

    console.log
      [ParserFactory] No suitable parser found for bank: kaspi, fileType: pdf

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:44:13)

    console.log
      [ParserFactory] Looking for parser for bank: kaspi, fileType: pdf

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:32:13)

    console.log
      [ParserFactory] Trying parser: BerekeNewParser

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:35:15)

    console.log
      [ParserFactory] Parser BerekeNewParser cannot parse this file

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:40:17)

    console.log
      [ParserFactory] Trying parser: BerekeOldParser

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:35:15)

    console.log
      [ParserFactory] Parser BerekeOldParser cannot parse this file

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:40:17)

    console.log
      [ParserFactory] Trying parser: KaspiParser

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:35:15)

    console.log
      [ParserFactory] Parser KaspiParser can parse this file

      at ParserFactoryService.log [as getParser] (src/modules/parsing/services/parser-factory.service.ts:37:17)

    console.log
      [ParserFactory] Detecting bank and format for file: /tmp/mock.pdf, type: pdf

      at ParserFactoryService.log [as detectBankAndFormat] (src/modules/parsing/services/parser-factory.service.ts:52:13)

    console.log
      [ParserFactory] Extracted text sample: kaspi bank statement...

      at ParserFactoryService.log [as detectBankAndFormat] (src/modules/parsing/services/parser-factory.service.ts:58:17)

    console.log
      [ParserFactory] Detected: Kaspi Bank

      at ParserFactoryService.log [as detectBankAndFormat] (src/modules/parsing/services/parser-factory.service.ts:69:19)

    console.log
      [ParserFactory] Detecting bank and format for file: /tmp/mock.xlsx, type: xlsx

      at ParserFactoryService.log [as detectBankAndFormat] (src/modules/parsing/services/parser-factory.service.ts:52:13)

    console.log
      [ParserFactory] Checking parser: BerekeNewParser

      at ParserFactoryService.log [as detectBankAndFormat] (src/modules/parsing/services/parser-factory.service.ts:97:15)

    console.log
      [ParserFactory] Checking parser: BerekeOldParser

      at ParserFactoryService.log [as detectBankAndFormat] (src/modules/parsing/services/parser-factory.service.ts:97:15)

    console.log
      [ParserFactory] Checking parser: KaspiParser

      at ParserFactoryService.log [as detectBankAndFormat] (src/modules/parsing/services/parser-factory.service.ts:97:15)

    console.log
      [ParserFactory] Detected: Kaspi Bank

      at ParserFactoryService.log [as detectBankAndFormat] (src/modules/parsing/services/parser-factory.service.ts:101:17)

 PASS   unit  @tests/unit/modules/statements/statements.service.spec.ts

Summary of all failing tests
 FAIL  @tests/unit/test/statement-processing.service.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/modules/parsing/services/statement-processing.service' from '@tests/unit/test/statement-processing.service.spec.ts'

    > 1 | import { StatementProcessingService } from '../src/modules/parsing/services/statement-processing.service';
        | ^
      2 | import { Statement, StatementStatus, FileType, BankName } from '../src/entities/statement.entity';
      3 | import { Transaction } from '../src/entities/transaction.entity';
      4 | import { ParsedStatement } from '../src/modules/parsing/interfaces/parsed-statement.interface';

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/statement-processing.service.spec.ts:1:1)

 FAIL  @tests/unit/test/classification.service.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/modules/classification/services/classification.service' from '@tests/unit/test/classification.service.spec.ts'

    > 1 | import { ClassificationService } from '../src/modules/classification/services/classification.service';
        | ^
      2 | import { Transaction, TransactionType } from '../src/entities/transaction.entity';
      3 | import { Category, CategoryType } from '../src/entities/category.entity';
      4 | import { Branch } from '../src/entities/branch.entity';

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/classification.service.spec.ts:1:1)

 FAIL  @tests/unit/modules/auth/guards/jwt-refresh.guard.spec.ts
  ● Test suite failed to run

    Configuration error:

    Could not locate module @/common/guards/jwt-refresh.guard mapped as:
    /Users/symonbaikov/finflow/parse-ledger/backend/src/$1.

    Please check your configuration for these entries:
    {
      "moduleNameMapper": {
        "/^@\/(.*)$/": "/Users/symonbaikov/finflow/parse-ledger/backend/src/$1"
      },
      "resolver": undefined
    }

      1 | import { Test, TestingModule } from '@nestjs/testing';
    > 2 | import { JwtRefreshGuard } from '@/common/guards/jwt-refresh.guard';
        | ^
      3 | import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
      4 | import { AuthGuard } from '@nestjs/passport';
      5 |

      at createNoMappedModuleFoundError (node_modules/jest-resolve/build/index.js:1117:17)
      at Object.require (@tests/unit/modules/auth/guards/jwt-refresh.guard.spec.ts:2:1)

 FAIL  @tests/unit/test/statements.service.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/common/utils/file-hash.util' from '@tests/unit/test/statements.service.spec.ts'

      3 | import * as fs from 'fs';
      4 |
    > 5 | jest.mock('../src/common/utils/file-hash.util', () => ({
        |      ^
      6 |   calculateFileHash: jest.fn(),
      7 | }));
      8 |

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.mock (@tests/unit/test/statements.service.spec.ts:5:6)

 FAIL  @tests/unit/test/pdf-parser.util.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/common/utils/pdf-parser.util' from '@tests/unit/test/pdf-parser.util.spec.ts'

      4 | import { spawnSync } from 'child_process';
      5 | import { PDFDocument, StandardFonts } from 'pdf-lib';
    > 6 | import {
        | ^
      7 |   extractTablesFromPdf,
      8 |   extractTextAndLayoutFromPdf,
      9 | } from '../src/common/utils/pdf-parser.util';

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/pdf-parser.util.spec.ts:6:1)

 FAIL  @tests/unit/test/async.util.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/common/utils/async.util' from '@tests/unit/test/async.util.spec.ts'

    > 1 | import { retry, sleep, TimeoutError, withTimeout } from '../src/common/utils/async.util';
        | ^
      2 |
      3 | describe('async.util', () => {
      4 |   it('withTimeout returns result when completed on time', async () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/async.util.spec.ts:1:1)

 FAIL  @tests/unit/test/filename.util.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/common/utils/filename.util' from '@tests/unit/test/filename.util.spec.ts'

    > 1 | import { normalizeFilename } from '../src/common/utils/filename.util';
        | ^
      2 |
      3 | describe('normalizeFilename', () => {
      4 |   it('decodes UTF-8->latin1 mojibake for Cyrillic filenames', () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/filename.util.spec.ts:1:1)

 FAIL  @tests/unit/test/semaphore.util.spec.ts
  ● Test suite failed to run

    Cannot find module '../src/common/utils/semaphore.util' from '@tests/unit/test/semaphore.util.spec.ts'

    > 1 | import { Semaphore } from '../src/common/utils/semaphore.util';
        | ^
      2 | import { sleep } from '../src/common/utils/async.util';
      3 |
      4 | describe('Semaphore', () => {

      at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/index.js:863:11)
      at Object.require (@tests/unit/test/semaphore.util.spec.ts:1:1)


Test Suites: 8 failed, 13 passed, 21 total
Tests:       221 passed, 221 total
Snapshots:   0 total
Time:        2.437 s
Ran all test suites.

    ~/finflow/parse-ledger/backend