import { describe, expect, it } from 'vitest';
import { getDateKey } from './date';

describe('getDateKey', () => {
  it('formats the date as YYYY-MM-DD with leading zeros', () => {
    expect(getDateKey(new Date('2026-01-05T10:00:00Z'))).toBe('2026-01-05');
  });

  it('uses Madrid time in summer (UTC+2)', () => {
    // 23:59:59 in Madrid
    expect(getDateKey(new Date('2026-10-13T21:59:59Z'))).toBe('2026-10-13');
    // 00:30 in Madrid, still the 13th in UTC
    expect(getDateKey(new Date('2026-10-13T22:30:00Z'))).toBe('2026-10-14');
  });

  it('uses Madrid time in winter (UTC+1)', () => {
    // 23:59:59 in Madrid
    expect(getDateKey(new Date('2026-01-15T22:59:59Z'))).toBe('2026-01-15');
    // 00:30 in Madrid, still the 15th in UTC
    expect(getDateKey(new Date('2026-01-15T23:30:00Z'))).toBe('2026-01-16');
  });

  it('works on the night the clocks change', () => {
    // 00:30 in Madrid on 29 March 2026, before the change at 02:00
    expect(getDateKey(new Date('2026-03-28T23:30:00Z'))).toBe('2026-03-29');
  });
});