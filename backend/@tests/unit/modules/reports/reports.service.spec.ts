import type { CustomTableColumn } from '@/entities';
import { CustomTableColumnType } from '@/entities/custom-table-column.entity';
import { ReportsService } from '@/modules/reports/reports.service';

function createRepoMock() {
  return {} as any;
}

describe('ReportsService (helpers)', () => {
  let service: ReportsService;

  beforeEach(() => {
    service = new ReportsService(
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
      createRepoMock() as any,
    );
  });

  it('parseNumber handles spaces and comma decimals', () => {
    const parseNumber = (service as any).parseNumber.bind(service) as (v: unknown) => number | null;
    expect(parseNumber(' 1 234,50 ')).toBe(1234.5);
    expect(parseNumber('not-a-number')).toBeNull();
    expect(parseNumber(null)).toBeNull();
  });

  it('parseDate supports YYYY-MM-DD and DD.MM.YYYY', () => {
    const parseDate = (service as any).parseDate.bind(service) as (v: unknown) => Date | null;
    expect(parseDate('2025-01-02')?.toISOString()).toContain('2025-01-02');
    expect(parseDate('2.1.2025')?.toISOString()).toContain('2025-01-02');
    expect(parseDate('bad')).toBeNull();
  });

  it('toDateKey normalizes date-ish inputs', () => {
    const toDateKey = (service as any).toDateKey.bind(service) as (v: unknown) => string;
    expect(toDateKey('2025-01-02T10:00:00.000Z')).toBe('2025-01-02');
    expect(toDateKey(new Date('2025-01-02T00:00:00.000Z'))).toBe('2025-01-02');
  });

  it('pickBestColumnKey chooses best match based on scorer', () => {
    const pickBestColumnKey = (service as any).pickBestColumnKey.bind(service) as (
      cols: CustomTableColumn[],
      scorer: (c: CustomTableColumn) => number,
    ) => string | null;
    const scoreAmount = (service as any).scoreAmountColumn.bind(service) as (
      c: CustomTableColumn,
    ) => number;

    const columns = [
      { key: 'a', title: 'Дата', type: CustomTableColumnType.DATE } as any,
      { key: 'b', title: 'Сумма', type: CustomTableColumnType.NUMBER } as any,
      { key: 'c', title: 'Год', type: CustomTableColumnType.NUMBER } as any,
    ] as CustomTableColumn[];

    expect(pickBestColumnKey(columns, scoreAmount)).toBe('b');
  });
});
