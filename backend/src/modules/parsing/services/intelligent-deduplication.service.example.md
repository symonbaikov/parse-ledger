# IntelligentDeduplicationService - Tolerant Matching

This document describes the enhanced tolerant matching capabilities of the `IntelligentDeduplicationService`.

## Overview

The service now includes two new public methods for cross-statement duplicate detection with configurable tolerances:

1. **`detectConflicts()`** - Detects potential duplicates between new and existing transactions
2. **`applyTolerantRules()`** - Applies fuzzy matching rules to compare two transactions

## Configuration

All tolerance thresholds are configurable via environment variables:

```bash
# Date tolerance (days)
DEDUP_DATE_TOLERANCE_DAYS=3

# Amount tolerance (percentage)
DEDUP_AMOUNT_TOLERANCE_PERCENT=2

# Text similarity threshold (0-1 scale)
DEDUP_TEXT_SIMILARITY_THRESHOLD=0.75

# Auto-resolve confidence threshold (0-1 scale)
IMPORT_CONFLICT_AUTO_RESOLVE_THRESHOLD=0.95
```

## Usage Example

### Basic Conflict Detection

```typescript
import { IntelligentDeduplicationService } from './services/intelligent-deduplication.service';
import { ParsedTransaction } from './interfaces/parsed-statement.interface';
import { Transaction } from '../../entities/transaction.entity';

// Inject the service
constructor(
  private readonly deduplicationService: IntelligentDeduplicationService,
  private readonly transactionRepository: Repository<Transaction>,
) {}

async detectDuplicatesForImport(
  newTransactions: ParsedTransaction[],
  workspaceId: string,
): Promise<void> {
  // Fetch existing transactions from the database (e.g., last 90 days)
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 90);

  const existingTransactions = await this.transactionRepository.find({
    where: {
      workspaceId,
      transactionDate: MoreThanOrEqual(dateFrom),
    },
  });

  // Detect conflicts
  const conflicts = await this.deduplicationService.detectConflicts(
    newTransactions,
    existingTransactions,
  );

  // Process conflicts
  for (const conflict of conflicts) {
    console.log(`Conflict detected:`);
    console.log(`  Match Type: ${conflict.matchType}`);
    console.log(`  Confidence: ${(conflict.confidence * 100).toFixed(1)}%`);
    console.log(`  Recommended Action: ${conflict.recommendedAction}`);
    console.log(`  Details:`, conflict.details);

    // Handle based on recommended action
    switch (conflict.recommendedAction) {
      case ConflictAction.KEEP_EXISTING:
        // Skip importing this transaction
        break;
      case ConflictAction.REPLACE:
        // Update the existing transaction with new data
        break;
      case ConflictAction.MERGE:
        // Merge data from both transactions
        break;
      case ConflictAction.MANUAL_REVIEW:
        // Flag for manual review by user
        break;
    }
  }
}
```

### Manual Transaction Comparison

```typescript
async compareTransactions(
  tx1: ParsedTransaction,
  tx2: Transaction,
): Promise<void> {
  const matchResult = this.deduplicationService.applyTolerantRules(tx1, tx2);

  if (matchResult.isMatch) {
    console.log(`Transactions match!`);
    console.log(`  Type: ${matchResult.matchType}`);
    console.log(`  Confidence: ${(matchResult.confidence * 100).toFixed(1)}%`);

    if (matchResult.details.dateDiff) {
      console.log(`  Date difference: ${matchResult.details.dateDiff} days`);
    }

    if (matchResult.details.amountDiff) {
      console.log(`  Amount difference: ${matchResult.details.amountDiff.toFixed(2)}%`);
    }

    if (matchResult.details.textSimilarity) {
      console.log(`  Text similarity: ${(matchResult.details.textSimilarity * 100).toFixed(1)}%`);
    }
  } else {
    console.log(`Transactions do not match`);
  }
}
```

## Match Types

The service returns different match types based on which fields have fuzzy differences:

- **`exact`**: Perfect match across all fields
- **`fuzzy_date`**: Date differs slightly (within tolerance), other fields match
- **`fuzzy_amount`**: Amount differs slightly (within tolerance), other fields match
- **`fuzzy_text`**: Text (merchant/purpose) differs slightly, other fields match
- **`combined`**: Multiple fields have fuzzy differences

## Recommended Actions

The service provides intelligent recommendations based on match type and confidence:

| Match Type | Confidence | Action | Reasoning |
|------------|-----------|--------|-----------|
| `exact` | ≥99% | `KEEP_EXISTING` | Identical transaction already exists |
| `fuzzy_date` | ≥95% | `REPLACE` | Bank likely corrected the transaction date |
| `fuzzy_amount` | ≥95% | `MERGE` | Likely pending vs. final settlement |
| `fuzzy_text` | ≥95% | `KEEP_EXISTING` | Formatting differences only |
| `combined` | ≥95% | `MANUAL_REVIEW` | Multiple differences require human review |
| any | 75-95% | `MANUAL_REVIEW` | Medium confidence requires verification |

## Confidence Calculation

The confidence score is a weighted average of three components:

```
confidence = (dateScore * 0.3) + (amountScore * 0.4) + (textSimilarity * 0.3)
```

Where:
- **dateScore**: Linear decay based on day difference (1.0 at 0 days, 0.0 at max tolerance)
- **amountScore**: Linear decay based on percentage difference (1.0 at 0%, 0.0 at max tolerance)
- **textSimilarity**: Levenshtein distance similarity between merchant/purpose fields (0-1 scale)

## Integration with Import Session Workflow

```typescript
// In ImportSessionService (Task #10)
async previewImport(statementId: string): Promise<ImportPreview> {
  const parsedTransactions = await this.parseStatement(statementId);
  const existingTransactions = await this.getRecentTransactions();

  const conflicts = await this.deduplicationService.detectConflicts(
    parsedTransactions,
    existingTransactions,
  );

  return {
    newTransactions: parsedTransactions.filter(
      tx => !conflicts.find(c => c.newTransaction === tx)
    ),
    conflicts: conflicts,
    stats: {
      total: parsedTransactions.length,
      new: parsedTransactions.length - conflicts.length,
      duplicates: conflicts.length,
    },
  };
}
```

## Performance Considerations

- **Time Complexity**: O(N × M) where N = new transactions, M = existing transactions
- **Optimization**: Use date range filtering to reduce M before calling `detectConflicts()`
- **Recommended**: Limit existing transactions to last 90 days for most use cases
- **Breaking Early**: The method stops after finding the first match per new transaction

## Testing

See comprehensive test suite at:
`backend/@tests/unit/modules/parsing/intelligent-deduplication-tolerant.spec.ts`

Test coverage includes:
- Exact matching
- Fuzzy date matching (within/beyond tolerance)
- Fuzzy amount matching (within/beyond tolerance)
- Fuzzy text matching (Levenshtein similarity)
- Combined fuzzy matching
- Edge cases (zero amounts, empty strings)
- Configuration-driven behavior
- Conflict detection workflow
- Recommended action logic
