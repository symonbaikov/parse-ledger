# Import Retry Service

Service for handling retry logic for failed import sessions with exponential backoff strategy.

## Overview

The `ImportRetryService` provides:
- Automatic retry scheduling with exponential backoff
- Error classification to determine retry eligibility
- Retry metadata tracking in import session
- Helper methods to manage retry lifecycle

## Configuration

Retry behavior is configured via environment variables (see `ImportConfigService`):

```bash
IMPORT_MAX_RETRIES=3              # Maximum retry attempts (1-10)
IMPORT_RETRY_BACKOFF_BASE_MS=30000  # Base delay in ms (1s-5min)
```

### Exponential Backoff Formula

```
backoff_delay = base_ms * 2^attempt
```

With default `base_ms = 30000`:
- Attempt 0: 30 seconds
- Attempt 1: 60 seconds (1 minute)
- Attempt 2: 120 seconds (2 minutes)
- Attempt 3: 240 seconds (4 minutes)

## API Methods

### scheduleRetry()

Schedules a retry for a failed import session.

```typescript
await retryService.scheduleRetry(sessionId, attempt, maxAttempts?);
```

**Parameters:**
- `sessionId`: Import session to retry
- `attempt`: Current retry attempt (0-indexed)
- `maxAttempts`: Optional max attempts override (defaults to config)

**Returns:** Promise<void>

**Throws:**
- `NotFoundException`: Session doesn't exist
- `ImportValidationError`: Invalid attempt number or max retries exceeded

**Side Effects:**
- Updates `sessionMetadata.retryCount`
- Sets `sessionMetadata.nextRetryAt` timestamp
- Appends to `sessionMetadata.retryHistory`

**Example:**
```typescript
try {
  await processImport(sessionId);
} catch (error) {
  if (retryService.shouldRetry(error)) {
    // Schedule first retry (attempt 0)
    await retryService.scheduleRetry(sessionId, 0);
  }
}
```

### executeRetry()

Executes a scheduled retry by resetting session to PENDING status.

```typescript
const session = await retryService.executeRetry(sessionId);
```

**Parameters:**
- `sessionId`: Import session to retry

**Returns:** Promise<ImportSession>

**Throws:**
- `NotFoundException`: Session doesn't exist
- `ImportValidationError`: Session not in FAILED status, no retry scheduled, or retry time not reached

**Side Effects:**
- Changes status from FAILED to PENDING
- Clears `sessionMetadata.nextRetryAt`

**Example:**
```typescript
// Called by cron job or admin API endpoint
const session = await retryService.executeRetry(sessionId);
await importService.processSession(session);
```

### shouldRetry()

Determines if an error should trigger a retry.

```typescript
const retryable = retryService.shouldRetry(error);
```

**Parameters:**
- `error`: Error to classify

**Returns:** boolean (true if retryable)

**Retry Decision Table:**

| Error Type | Retryable | Reason |
|-----------|-----------|--------|
| ImportTransientError | ✅ Yes | Temporary failure |
| ImportValidationError | ❌ No | User input error |
| ImportConflictError | ❌ No | Requires user decision |
| ImportFatalError | ❌ No | Permanent failure |
| Database deadlock | ✅ Yes | Classified as transient |
| Network timeout | ✅ Yes | Classified as transient |
| Unknown error | ❌ No | Conservative default |

**Example:**
```typescript
try {
  await importData();
} catch (error) {
  if (retryService.shouldRetry(error)) {
    console.log('Error is retryable - scheduling retry');
  } else {
    console.log('Error is permanent - marking as failed');
  }
}
```

### getRetryMetadata()

Extracts retry metadata from session.

```typescript
const metadata = retryService.getRetryMetadata(session);
```

**Returns:** RetryMetadata | null

```typescript
interface RetryMetadata {
  retryCount: number;
  lastRetryAt: string | null;
  nextRetryAt: string | null;
  lastError: {
    message: string;
    code: string;
    timestamp: string;
  } | null;
  retryHistory: Array<{
    attempt: number;
    timestamp: string;
    error: string;
  }>;
}
```

### canRetry()

Checks if session has retry attempts remaining.

```typescript
const canRetry = retryService.canRetry(session, maxAttempts?);
```

**Parameters:**
- `session`: Import session
- `maxAttempts`: Optional max attempts override

**Returns:** boolean

**Example:**
```typescript
if (retryService.canRetry(session)) {
  await retryService.scheduleRetry(session.id, attemptNumber);
} else {
  await retryService.markAsPermanentlyFailed(session.id, error);
}
```

### markAsPermanentlyFailed()

Marks session as permanently failed (no more retries).

```typescript
await retryService.markAsPermanentlyFailed(sessionId, error);
```

**Parameters:**
- `sessionId`: Import session
- `error`: Final error

**Side Effects:**
- Sets status to FAILED
- Appends error to `sessionMetadata.errors`
- Clears `sessionMetadata.nextRetryAt`

**Example:**
```typescript
if (!retryService.canRetry(session) || !retryService.shouldRetry(error)) {
  await retryService.markAsPermanentlyFailed(session.id, error);
}
```

## Usage Patterns

### Pattern 1: Simple Retry on Failure

```typescript
async processImport(sessionId: string): Promise<void> {
  try {
    await this.doImport(sessionId);
  } catch (error) {
    const session = await this.getSession(sessionId);
    const currentAttempt = this.retryService.getRetryMetadata(session)?.retryCount || 0;

    if (this.retryService.shouldRetry(error) && this.retryService.canRetry(session)) {
      await this.retryService.scheduleRetry(sessionId, currentAttempt);
    } else {
      await this.retryService.markAsPermanentlyFailed(sessionId, error);
    }

    throw error;
  }
}
```

### Pattern 2: Scheduled Retry Execution (Cron)

```typescript
@Cron('*/5 * * * *') // Every 5 minutes
async processScheduledRetries(): Promise<void> {
  const sessions = await this.findSessionsReadyForRetry();

  for (const session of sessions) {
    try {
      const retriedSession = await this.retryService.executeRetry(session.id);
      await this.processImport(retriedSession.id);
    } catch (error) {
      this.logger.error(`Retry failed for session ${session.id}:`, error);
    }
  }
}

private async findSessionsReadyForRetry(): Promise<ImportSession[]> {
  return this.importSessionRepository
    .createQueryBuilder('session')
    .where('session.status = :status', { status: ImportSessionStatus.FAILED })
    .andWhere("session.sessionMetadata->>'nextRetryAt' IS NOT NULL")
    .andWhere("(session.sessionMetadata->>'nextRetryAt')::timestamp <= NOW()")
    .getMany();
}
```

### Pattern 3: Manual Retry (Admin API)

```typescript
@Post('import-sessions/:id/retry')
async manualRetry(@Param('id') sessionId: string): Promise<ImportSession> {
  const session = await this.retryService.executeRetry(sessionId);

  // Process in background
  this.processImport(session.id).catch(error => {
    this.logger.error('Manual retry failed:', error);
  });

  return session;
}
```

## Session Metadata Structure

After scheduling a retry, the session metadata contains:

```json
{
  "totalTransactions": 100,
  "newCount": 50,
  "matchedCount": 40,
  "skippedCount": 5,
  "conflictedCount": 5,
  "failedCount": 0,
  "conflicts": [],
  "warnings": [],
  "errors": ["Database deadlock detected"],
  "retryCount": 1,
  "lastRetryAt": "2024-01-29T10:00:00Z",
  "nextRetryAt": "2024-01-29T10:00:30Z",
  "lastError": {
    "message": "Database deadlock detected",
    "code": "IMPORT_TRANSIENT_ERROR",
    "timestamp": "2024-01-29T10:00:00Z"
  },
  "retryHistory": [
    {
      "attempt": 1,
      "timestamp": "2024-01-29T10:00:00Z",
      "error": "Database deadlock detected"
    }
  ]
}
```

## Best Practices

1. **Always check retry eligibility**: Use `shouldRetry()` and `canRetry()` before scheduling
2. **Log retry attempts**: Track retry history for debugging
3. **Use exponential backoff**: Don't override with custom delays unless necessary
4. **Handle max retries gracefully**: Mark as permanently failed when limit reached
5. **Classify errors properly**: Use import error classes for better retry decisions
6. **Monitor retry metrics**: Track retry rates and success/failure ratios
7. **Implement idempotency**: Ensure retries are safe to execute multiple times

## Integration with Other Services

### With Import Session Service

```typescript
@Injectable()
class ImportSessionService {
  constructor(
    private readonly retryService: ImportRetryService,
    private readonly processingService: StatementProcessingService,
  ) {}

  async handleImportFailure(session: ImportSession, error: unknown): Promise<void> {
    const metadata = this.retryService.getRetryMetadata(session);
    const attempt = metadata?.retryCount || 0;

    if (this.retryService.shouldRetry(error) && this.retryService.canRetry(session)) {
      await this.retryService.scheduleRetry(session.id, attempt);
      this.logger.warn(`Scheduled retry ${attempt + 1} for session ${session.id}`);
    } else {
      await this.retryService.markAsPermanentlyFailed(session.id, error);
      this.logger.error(`Session ${session.id} permanently failed`);
    }
  }
}
```

### With Audit Logging

```typescript
async scheduleRetry(sessionId: string, attempt: number): Promise<void> {
  await this.retryService.scheduleRetry(sessionId, attempt);

  await this.auditService.log({
    action: 'import_retry_scheduled',
    resourceType: 'import_session',
    resourceId: sessionId,
    details: { attempt, nextRetryAt: /* ... */ },
  });
}
```

## Error Handling

The service throws specific errors that should be handled:

```typescript
try {
  await retryService.scheduleRetry(sessionId, 3);
} catch (error) {
  if (error instanceof NotFoundException) {
    // Session doesn't exist
  } else if (error instanceof ImportValidationError) {
    // Invalid request (max retries exceeded, negative attempt, etc.)
  } else {
    // Unexpected error
  }
}
```
