# Import Configuration

This module provides centralized configuration management for the import session system.

## Overview

The `ImportConfigService` loads and validates import-related environment variables, providing type-safe access to configuration values with sensible defaults.

## Environment Variables

All environment variables are optional and have default values:

| Variable | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `DEDUP_DATE_TOLERANCE_DAYS` | integer | 3 | 0-30 | Number of days tolerance for date matching during deduplication |
| `DEDUP_AMOUNT_TOLERANCE_PERCENT` | number | 2 | 0-100 | Percentage tolerance for amount matching during deduplication |
| `DEDUP_TEXT_SIMILARITY_THRESHOLD` | number | 0.75 | 0-1 | Text similarity threshold for description matching (0-1 scale) |
| `IMPORT_AUTO_COMMIT` | boolean | false | - | Whether to automatically commit import sessions when confidence is high |
| `IMPORT_MAX_RETRIES` | integer | 3 | 1-10 | Maximum number of retry attempts for failed operations |
| `IMPORT_RETRY_BACKOFF_BASE_MS` | integer | 30000 | 1000-300000 | Base delay in milliseconds for exponential backoff retry strategy |
| `IMPORT_CONFLICT_AUTO_RESOLVE_THRESHOLD` | number | 0.95 | 0-1 | Confidence threshold for automatic conflict resolution |

## Usage

### In a NestJS Module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImportConfigService } from './config/import.config';

@Module({
  imports: [ConfigModule],
  providers: [ImportConfigService],
  exports: [ImportConfigService],
})
export class ImportModule {}
```

### In a Service

```typescript
import { Injectable } from '@nestjs/common';
import { ImportConfigService } from '../config/import.config';

@Injectable()
export class DeduplicationService {
  constructor(private readonly importConfig: ImportConfigService) {}

  checkDuplicates() {
    const dateToleranceDays = this.importConfig.getDedupDateToleranceDays();
    const amountTolerancePercent = this.importConfig.getDedupAmountTolerancePercent();
    const textSimilarityThreshold = this.importConfig.getDedupTextSimilarityThreshold();

    // Use configuration values...
  }
}
```

### Available Methods

- `getConfig()`: Get the complete validated configuration object
- `getDedupDateToleranceDays()`: Get date tolerance in days
- `getDedupAmountTolerancePercent()`: Get amount tolerance as percentage
- `getDedupTextSimilarityThreshold()`: Get text similarity threshold (0-1)
- `isAutoCommitEnabled()`: Check if auto-commit is enabled
- `getMaxRetries()`: Get maximum retry attempts
- `getRetryBackoffBaseMs()`: Get base backoff delay in milliseconds
- `getConflictAutoResolveThreshold()`: Get conflict auto-resolve threshold (0-1)
- `calculateRetryBackoff(attempt: number)`: Calculate exponential backoff delay for a retry attempt

## Validation

All configuration values are validated on service initialization using `class-validator`:

- Integer values must be within specified ranges
- Decimal values (thresholds, percentages) must be within 0-1 or 0-100 ranges
- Invalid values will throw an error on application startup
- Invalid or non-numeric strings default to the predefined default values

## Examples

### Setting up for production

```bash
# .env.production
DEDUP_DATE_TOLERANCE_DAYS=5
DEDUP_AMOUNT_TOLERANCE_PERCENT=1
DEDUP_TEXT_SIMILARITY_THRESHOLD=0.85
IMPORT_AUTO_COMMIT=true
IMPORT_MAX_RETRIES=5
IMPORT_RETRY_BACKOFF_BASE_MS=60000
IMPORT_CONFLICT_AUTO_RESOLVE_THRESHOLD=0.98
```

### Calculating retry delays

```typescript
const service = new ImportConfigService(configService);

// With default base of 30000ms:
service.calculateRetryBackoff(0); // 30000ms (30s)
service.calculateRetryBackoff(1); // 60000ms (1m)
service.calculateRetryBackoff(2); // 120000ms (2m)
service.calculateRetryBackoff(3); // 240000ms (4m)
```

## Testing

The configuration service includes comprehensive unit tests covering:
- Default value loading
- Custom value parsing
- Validation rules (min/max bounds)
- Boolean parsing
- Decimal number handling
- Invalid value handling
- Retry backoff calculation

Run tests with:
```bash
npm run test:unit -- @tests/unit/modules/import/config/import.config.spec.ts
```
