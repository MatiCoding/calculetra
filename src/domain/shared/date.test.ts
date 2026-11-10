import { describe, expect, it } from 'vitest';
import { formatCountdown, getDateKey, msUntilNextChallenge } from './date';

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
describe('msUntilNextChallenge', () => {
  it('counts until midnight in Madrid in winter (UTC+1)', () => {
    // 23:30 in Madrid
    expect(msUntilNextChallenge(new Date('2026-11-10T22:30:00Z'))).toBe(30 * 60 * 1000);
  });

  it('counts until midnight in Madrid in summer (UTC+2)', () => {
    // 23:00 in Madrid
    expect(msUntilNextChallenge(new Date('2026-07-01T21:00:00Z'))).toBe(60 * 60 * 1000);
  });

  it('counts the milliseconds too', () => {
    // 23:59:59.500 in Madrid
    expect(msUntilNextChallenge(new Date('2026-11-10T22:59:59.500Z'))).toBe(500);
  });

  it('gives a whole day right at midnight', () => {
    expect(msUntilNextChallenge(new Date('2026-11-10T23:00:00Z'))).toBe(24 * 60 * 60 * 1000);
  });
});

describe('formatCountdown', () => {
  it('writes hours, minutes and seconds with two digits', () => {
    expect(formatCountdown((1 * 3600 + 2 * 60 + 3) * 1000)).toBe('01:02:03');
  });

  it('drops the part of a second that is left', () => {
    expect(formatCountdown(59_999)).toBe('00:00:59');
  });

  it('writes 00:00:00 for zero', () => {
    expect(formatCountdown(0)).toBe('00:00:00');
  });
});
