import { describe, expect, it } from 'vitest';
import { getStatementMerchantLabel, isStatementProcessingStatus } from '../statement-status';

describe('statement status helpers', () => {
  it('detects processing statuses', () => {
    expect(isStatementProcessingStatus('uploaded')).toBe(true);
    expect(isStatementProcessingStatus('processing')).toBe(true);
    expect(isStatementProcessingStatus('completed')).toBe(false);
  });

  it('returns scanning label when processing', () => {
    expect(getStatementMerchantLabel('processing', 'Kaspi', 'Scanning...')).toBe('Scanning...');
  });

  it('returns merchant label when completed', () => {
    expect(getStatementMerchantLabel('completed', 'Kaspi', 'Scanning...')).toBe('Kaspi');
  });
});
