# ImportRetryService Integration Example

This document demonstrates how to use ImportRetryService in other modules.

## Basic Usage in a Service

```typescript
import { Injectable } from '@nestjs/common';
import { ImportRetryService } from '../import/services/import-retry.service';
import { ImportTransientError } from '../import/errors/import-errors';

@Injectable()
export class MyImportService {
  constructor(
    private readonly retryService: ImportRetryService,
  ) {}

  async processImport(sessionId: string): Promise<void> {
    try {
      // Attempt import
      await this.doImport(sessionId);
    } catch (error) {
      // Check if error is retryable
      if (this.retryService.shouldRetry(error)) {
        const session = await this.getSession(sessionId);
        const metadata = this.retryService.getRetryMetadata(session);
        const currentAttempt = metadata?.retryCount || 0;

        // Schedule retry if attempts remain
        if (this.retryService.canRetry(session)) {
          await this.retryService.scheduleRetry(sessionId, currentAttempt);
          throw new ImportTransientError('Import failed, retry scheduled', error as Error);
        } else {
          await this.retryService.markAsPermanentlyFailed(sessionId, error);
          throw error;
        }
      } else {
        // Not retryable - mark as permanently failed
        await this.retryService.markAsPermanentlyFailed(sessionId, error);
        throw error;
      }
    }
  }
}
```

## Module Registration

To use ImportRetryService in your module:

```typescript
import { Module } from '@nestjs/common';
import { ImportModule } from '../import/import.module';
import { MyImportService } from './my-import.service';

@Module({
  imports: [
    ImportModule, // Import the entire module
  ],
  providers: [MyImportService],
  exports: [MyImportService],
})
export class MyModule {}
```

## Dependency Injection Verification

The ImportModule properly exports ImportRetryService, so it can be injected:

```typescript
@Injectable()
export class StatementProcessingService {
  constructor(
    private readonly retryService: ImportRetryService, // ✅ Available via DI
    private readonly configService: ImportConfigService, // ✅ Also available
  ) {}

  async process(sessionId: string): Promise<void> {
    // Both services are properly injected and ready to use
    const maxRetries = this.configService.getMaxRetries();

    try {
      // ... processing logic
    } catch (error) {
      if (this.retryService.shouldRetry(error)) {
        await this.retryService.scheduleRetry(sessionId, 0);
      }
    }
  }
}
```

## Testing with ImportModule

When writing tests for services that use ImportRetryService:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ImportModule } from '../import/import.module';
import { ImportRetryService } from '../import/services/import-retry.service';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;
  let retryService: ImportRetryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ImportModule], // Import the module
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
    retryService = module.get<ImportRetryService>(ImportRetryService);
  });

  it('should use retry service', async () => {
    const spy = jest.spyOn(retryService, 'shouldRetry');
    // ... test logic
    expect(spy).toHaveBeenCalled();
  });
});
```

## Available Services

ImportModule exports:
- ✅ `ImportConfigService` - Configuration management
- ✅ `ImportRetryService` - Retry logic and error classification

Both services are fully tested and ready for use in:
- Import Session Service (Task #10)
- Statement Processing Service (Task #6)
- Import Session Controller (Task #8)
- Any other module that needs retry logic
