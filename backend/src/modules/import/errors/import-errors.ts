import { BadRequestException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base error for import operations with error codes
 */
export abstract class ImportError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userMessage: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error - user input or data format is invalid
 * Not retryable - requires user action to fix
 *
 * Examples:
 * - Invalid file format
 * - Missing required fields
 * - Schema validation failures
 * - Invalid configuration
 */
export class ImportValidationError extends ImportError {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(
      message,
      'IMPORT_VALIDATION_ERROR',
      'The import data is invalid. Please check the file format and try again.',
    );
  }

  /**
   * Convert to HTTP exception for controller responses
   */
  toHttpException(): HttpException {
    return new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      message: this.userMessage,
      error: this.code,
      details: this.details,
    });
  }
}

/**
 * Conflict error - operation conflicts with existing state
 * Not retryable - requires resolution or user decision
 *
 * Examples:
 * - Duplicate import session
 * - Conflicting transaction matches
 * - State transition not allowed
 * - Resource already exists
 */
export class ImportConflictError extends ImportError {
  constructor(
    message: string,
    public readonly conflictType: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(
      message,
      'IMPORT_CONFLICT_ERROR',
      'The import conflicts with existing data. Please review and resolve conflicts.',
    );
  }

  /**
   * Convert to HTTP exception for controller responses
   */
  toHttpException(): HttpException {
    return new ConflictException({
      statusCode: HttpStatus.CONFLICT,
      message: this.userMessage,
      error: this.code,
      conflictType: this.conflictType,
      details: this.details,
    });
  }
}

/**
 * Transient error - temporary failure that may succeed on retry
 * Retryable - caused by temporary conditions
 *
 * Examples:
 * - Database deadlock or lock timeout
 * - Network timeout
 * - Temporary service unavailability
 * - Rate limit exceeded (with backoff)
 * - Transient parsing errors
 */
export class ImportTransientError extends ImportError {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly retryAfterMs?: number,
  ) {
    super(
      message,
      'IMPORT_TRANSIENT_ERROR',
      'The import operation failed temporarily. It will be retried automatically.',
    );
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }

  /**
   * Convert to HTTP exception for controller responses
   */
  toHttpException(): HttpException {
    return new HttpException(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: this.userMessage,
        error: this.code,
        retryAfterMs: this.retryAfterMs,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

/**
 * Fatal error - permanent failure that should not be retried
 * Not retryable - indicates serious system issue
 *
 * Examples:
 * - File not found or corrupted
 * - Permission denied (insufficient access rights)
 * - Workspace or user not found
 * - Critical database constraint violation
 * - Unrecoverable parsing error
 */
export class ImportFatalError extends ImportError {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly details?: Record<string, unknown>,
  ) {
    super(
      message,
      'IMPORT_FATAL_ERROR',
      'The import operation failed permanently. Please contact support if the issue persists.',
    );
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }

  /**
   * Convert to HTTP exception for controller responses
   */
  toHttpException(): HttpException {
    return new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.userMessage,
        error: this.code,
        details: this.details,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Type guard to check if error is an ImportError
 */
export function isImportError(error: unknown): error is ImportError {
  return error instanceof ImportError;
}

/**
 * Helper to classify unknown errors into import error types
 * Used by retry service to determine if error is retryable
 */
export function classifyError(error: unknown): ImportError {
  // Already an import error
  if (isImportError(error)) {
    return error;
  }

  // TypeORM QueryFailedError
  if (error && typeof error === 'object' && 'name' in error) {
    const err = error as { name: string; driverError?: { code?: string }; message?: string };

    if (err.name === 'QueryFailedError') {
      const pgCode = err.driverError?.code;
      const message = err.message || 'Database query failed';

      // Deadlock or lock timeout - retryable
      if (pgCode === '40P01' || pgCode === '55P03') {
        return new ImportTransientError(
          `Database deadlock or lock timeout: ${message}`,
          error as Error,
        );
      }

      // Unique constraint violation - conflict
      if (pgCode === '23505') {
        return new ImportConflictError(message, 'unique_constraint', {
          pgCode,
        });
      }

      // Foreign key violation - validation error
      if (pgCode === '23503') {
        return new ImportValidationError(message, { pgCode });
      }

      // Connection errors - transient
      if (pgCode === '57P01' || pgCode === '08006' || pgCode === '08003') {
        return new ImportTransientError(`Database connection error: ${message}`, error as Error);
      }

      // Other database errors - fatal
      return new ImportFatalError(`Database error: ${message}`, error as Error);
    }
  }

  // HTTP exceptions
  if (error instanceof HttpException) {
    const status = error.getStatus();

    // 4xx errors are typically not retryable
    if (status >= 400 && status < 500) {
      if (status === HttpStatus.CONFLICT) {
        return new ImportConflictError(error.message, 'http_conflict');
      }
      if (status === HttpStatus.BAD_REQUEST) {
        return new ImportValidationError(error.message);
      }
      if (status === HttpStatus.FORBIDDEN || status === HttpStatus.UNAUTHORIZED) {
        return new ImportFatalError('Permission denied', error);
      }
      if (status === HttpStatus.NOT_FOUND) {
        return new ImportFatalError('Resource not found', error);
      }
    }

    // 5xx errors are typically retryable
    if (status >= 500) {
      if (status === HttpStatus.SERVICE_UNAVAILABLE || status === HttpStatus.GATEWAY_TIMEOUT) {
        return new ImportTransientError('Service temporarily unavailable', error);
      }
    }
  }

  // Generic errors - treat as fatal by default
  const message = error instanceof Error ? error.message : String(error);
  return new ImportFatalError(`Unexpected error: ${message}`, error as Error);
}
