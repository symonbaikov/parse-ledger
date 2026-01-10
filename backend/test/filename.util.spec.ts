import { normalizeFilename } from '../src/common/utils/filename.util';

describe('normalizeFilename', () => {
  it('decodes UTF-8->latin1 mojibake for Cyrillic filenames', () => {
    expect(normalizeFilename('Ð\x9FÑ\x80Ð¸Ð¼ÐµÑ\x80.pdf')).toBe('Пример.pdf');
  });

  it('keeps normal ASCII filenames intact', () => {
    expect(normalizeFilename('statement-2026-01-01.pdf')).toBe('statement-2026-01-01.pdf');
  });

  it('keeps already-cyrillic filenames intact', () => {
    expect(normalizeFilename('Выписка 01.01.2026.pdf')).toBe('Выписка 01.01.2026.pdf');
  });
});

