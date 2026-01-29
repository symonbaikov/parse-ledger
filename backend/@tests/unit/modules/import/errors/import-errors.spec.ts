import { BadRequestException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import {
  ImportConflictError,
  ImportFatalError,
  ImportTransientError,
  ImportValidationError,
  classifyError,
  isImportError,
} from '../../../../../src/modules/import/errors/import-errors';

describe('Import Error Classes', () => {
  describe('ImportValidationError', () => {
    it('should create validation error with correct properties', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new ImportValidationError('Invalid email format', details);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ImportValidationError);
      expect(error.message).toBe('Invalid email format');
      expect(error.code).toBe('IMPORT_VALIDATION_ERROR');
      expect(error.userMessage).toBe(
        'The import data is invalid. Please check the file format and try again.',
      );
      expect(error.details).toEqual(details);
      expect(error.name).toBe('ImportValidationError');
    });

    it('should convert to BadRequestException', () => {
      const error = new ImportValidationError('Test error', { test: true });
      const httpException = error.toHttpException();

      expect(httpException).toBeInstanceOf(BadRequestException);
      expect(httpException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      const response = httpException.getResponse() as any;
      expect(response.error).toBe('IMPORT_VALIDATION_ERROR');
      expect(response.details).toEqual({ test: true });
    });
  });

  describe('ImportConflictError', () => {
    it('should create conflict error with correct properties', () => {
      const details = { existingId: '123', newId: '456' };
      const error = new ImportConflictError(
        'Duplicate session detected',
        'duplicate_session',
        details,
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ImportConflictError);
      expect(error.message).toBe('Duplicate session detected');
      expect(error.code).toBe('IMPORT_CONFLICT_ERROR');
      expect(error.userMessage).toBe(
        'The import conflicts with existing data. Please review and resolve conflicts.',
      );
      expect(error.conflictType).toBe('duplicate_session');
      expect(error.details).toEqual(details);
    });

    it('should convert to ConflictException', () => {
      const error = new ImportConflictError('Test conflict', 'test_type', { key: 'value' });
      const httpException = error.toHttpException();

      expect(httpException).toBeInstanceOf(ConflictException);
      expect(httpException.getStatus()).toBe(HttpStatus.CONFLICT);
      const response = httpException.getResponse() as any;
      expect(response.error).toBe('IMPORT_CONFLICT_ERROR');
      expect(response.conflictType).toBe('test_type');
      expect(response.details).toEqual({ key: 'value' });
    });
  });

  describe('ImportTransientError', () => {
    it('should create transient error with correct properties', () => {
      const cause = new Error('Connection timeout');
      const error = new ImportTransientError('Database unavailable', cause, 5000);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ImportTransientError);
      expect(error.message).toBe('Database unavailable');
      expect(error.code).toBe('IMPORT_TRANSIENT_ERROR');
      expect(error.userMessage).toBe(
        'The import operation failed temporarily. It will be retried automatically.',
      );
      expect(error.cause).toBe(cause);
      expect(error.retryAfterMs).toBe(5000);
      expect(error.stack).toContain('Caused by:');
    });

    it('should convert to HttpException with SERVICE_UNAVAILABLE status', () => {
      const error = new ImportTransientError('Test transient', undefined, 3000);
      const httpException = error.toHttpException();

      expect(httpException).toBeInstanceOf(HttpException);
      expect(httpException.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const response = httpException.getResponse() as any;
      expect(response.error).toBe('IMPORT_TRANSIENT_ERROR');
      expect(response.retryAfterMs).toBe(3000);
    });
  });

  describe('ImportFatalError', () => {
    it('should create fatal error with correct properties', () => {
      const cause = new Error('File not found');
      const details = { filePath: '/tmp/missing.csv' };
      const error = new ImportFatalError('Cannot read file', cause, details);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ImportFatalError);
      expect(error.message).toBe('Cannot read file');
      expect(error.code).toBe('IMPORT_FATAL_ERROR');
      expect(error.userMessage).toBe(
        'The import operation failed permanently. Please contact support if the issue persists.',
      );
      expect(error.cause).toBe(cause);
      expect(error.details).toEqual(details);
      expect(error.stack).toContain('Caused by:');
    });

    it('should convert to HttpException with INTERNAL_SERVER_ERROR status', () => {
      const error = new ImportFatalError('Test fatal', undefined, { detail: 'info' });
      const httpException = error.toHttpException();

      expect(httpException).toBeInstanceOf(HttpException);
      expect(httpException.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      const response = httpException.getResponse() as any;
      expect(response.error).toBe('IMPORT_FATAL_ERROR');
      expect(response.details).toEqual({ detail: 'info' });
    });
  });

  describe('isImportError', () => {
    it('should return true for ImportError instances', () => {
      expect(isImportError(new ImportValidationError('test'))).toBe(true);
      expect(isImportError(new ImportConflictError('test', 'type'))).toBe(true);
      expect(isImportError(new ImportTransientError('test'))).toBe(true);
      expect(isImportError(new ImportFatalError('test'))).toBe(true);
    });

    it('should return false for non-ImportError instances', () => {
      expect(isImportError(new Error('test'))).toBe(false);
      expect(isImportError(new BadRequestException('test'))).toBe(false);
      expect(isImportError('string')).toBe(false);
      expect(isImportError(null)).toBe(false);
      expect(isImportError(undefined)).toBe(false);
    });
  });

  describe('classifyError', () => {
    it('should return ImportError as-is', () => {
      const original = new ImportValidationError('test');
      const classified = classifyError(original);
      expect(classified).toBe(original);
    });

    describe('QueryFailedError classification', () => {
      it('should classify deadlock as transient', () => {
        const error = {
          name: 'QueryFailedError',
          message: 'deadlock detected',
          driverError: { code: '40P01' },
        };
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportTransientError);
        expect(classified.message).toContain('deadlock');
      });

      it('should classify lock timeout as transient', () => {
        const error = {
          name: 'QueryFailedError',
          message: 'lock timeout',
          driverError: { code: '55P03' },
        };
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportTransientError);
        expect(classified.message).toContain('lock timeout');
      });

      it('should classify unique constraint violation as conflict', () => {
        const error = {
          name: 'QueryFailedError',
          message: 'duplicate key value',
          driverError: { code: '23505' },
        };
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportConflictError);
        expect(classified.conflictType).toBe('unique_constraint');
      });

      it('should classify foreign key violation as validation error', () => {
        const error = {
          name: 'QueryFailedError',
          message: 'foreign key constraint',
          driverError: { code: '23503' },
        };
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportValidationError);
      });

      it('should classify connection errors as transient', () => {
        const connectionCodes = ['57P01', '08006', '08003'];
        for (const code of connectionCodes) {
          const error = {
            name: 'QueryFailedError',
            message: 'connection error',
            driverError: { code },
          };
          const classified = classifyError(error);

          expect(classified).toBeInstanceOf(ImportTransientError);
          expect(classified.message).toContain('connection error');
        }
      });

      it('should classify other database errors as fatal', () => {
        const error = {
          name: 'QueryFailedError',
          message: 'unknown database error',
          driverError: { code: '99999' },
        };
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportFatalError);
      });
    });

    describe('HttpException classification', () => {
      it('should classify 409 Conflict as ImportConflictError', () => {
        const error = new HttpException('Conflict', HttpStatus.CONFLICT);
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportConflictError);
        expect(classified.conflictType).toBe('http_conflict');
      });

      it('should classify 400 Bad Request as ImportValidationError', () => {
        const error = new BadRequestException('Invalid input');
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportValidationError);
      });

      it('should classify 403 Forbidden as ImportFatalError', () => {
        const error = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportFatalError);
        expect(classified.message).toBe('Permission denied');
      });

      it('should classify 404 Not Found as ImportFatalError', () => {
        const error = new HttpException('Not Found', HttpStatus.NOT_FOUND);
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportFatalError);
        expect(classified.message).toBe('Resource not found');
      });

      it('should classify 503 Service Unavailable as ImportTransientError', () => {
        const error = new HttpException('Unavailable', HttpStatus.SERVICE_UNAVAILABLE);
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportTransientError);
      });

      it('should classify 504 Gateway Timeout as ImportTransientError', () => {
        const error = new HttpException('Timeout', HttpStatus.GATEWAY_TIMEOUT);
        const classified = classifyError(error);

        expect(classified).toBeInstanceOf(ImportTransientError);
      });
    });

    it('should classify generic Error as ImportFatalError', () => {
      const error = new Error('Something went wrong');
      const classified = classifyError(error);

      expect(classified).toBeInstanceOf(ImportFatalError);
      expect(classified.message).toContain('Something went wrong');
    });

    it('should classify unknown types as ImportFatalError', () => {
      const classified = classifyError('string error');

      expect(classified).toBeInstanceOf(ImportFatalError);
      expect(classified.message).toContain('string error');
    });
  });
});
