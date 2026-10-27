import { describe, expect, it } from 'vitest';
import { generateChallenge, getChallengeNumber, getDailyChallenge, getDateKey } from './challenge';
import { createRandom } from './random';

const SMALL_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const BIG_NUMBERS = [25, 50, 75, 100];

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

describe('generateChallenge', () => {
  // Many seeds, so a rule that only fails sometimes is caught.
  const challenges = Array.from({ length: 200 }, (_, seed) =>
    generateChallenge(createRandom(seed)),
  );

  it('has 6 numbers', () => {
    for (const { numbers } of challenges) {
      expect(numbers).toHaveLength(6);
    }
  });

  it('only uses numbers from the bag', () => {
    const bag = [...SMALL_NUMBERS, ...BIG_NUMBERS];

    for (const { numbers } of challenges) {
      for (const number of numbers) {
        expect(bag).toContain(number);
      }
    }
  });

  it('never repeats a number', () => {
    for (const { numbers } of challenges) {
      expect(new Set(numbers).size).toBe(numbers.length);
    }
  });

  it('has a whole target between 101 and 999', () => {
    for (const { target } of challenges) {
      expect(Number.isInteger(target)).toBe(true);
      expect(target).toBeGreaterThanOrEqual(101);
      expect(target).toBeLessThanOrEqual(999);
    }
  });

  it('reaches both ends of the target range', () => {
    expect(generateChallenge(() => 0).target).toBe(101);
    expect(generateChallenge(() => 0.9999999).target).toBe(999);
  });

  it('gives the same challenge for the same seed', () => {
    expect(generateChallenge(createRandom(7))).toEqual(
      generateChallenge(createRandom(7)),
    );
  });

  it('can draw every number of the bag', () => {
    const drawn = new Set(challenges.flatMap(({ numbers }) => numbers));
    
    expect([...drawn].sort((a, b) => a - b)).toEqual([
      ...SMALL_NUMBERS,
      ...BIG_NUMBERS,
    ]);
  });
});

describe('getDailyChallenge', () => {
  it('gives the same challenge for the same date', () => {
    const date = new Date('2026-10-13T10:00:00Z');

    expect(getDailyChallenge(date)).toEqual(getDailyChallenge(date));
  });

  it('gives the same challenge at any time of the same day in Madrid', () => {
    // 00:30 and 23:30 on 14 October in Madrid
    const earlyMorning = new Date('2026-10-13T22:30:00Z');
    const lateNight = new Date('2026-10-14T21:30:00Z');

    expect(getDailyChallenge(earlyMorning)).toEqual(
      getDailyChallenge(lateNight),
    );
  });

  it('gives a different challenge on a different day', () => {
    expect(getDailyChallenge(new Date('2026-10-13T10:00:00Z'))).not.toEqual(
      getDailyChallenge(new Date('2026-10-14T10:00:00Z')),
    );
  });
});

describe('getChallengeNumber', () => {
  it('is 1 on the first day (19 October 2026)', () => {
    expect(getChallengeNumber(new Date('2026-10-19T10:00:00Z'))).toBe(1);
  });

  it('goes up by one each day', () => {
    expect(getChallengeNumber(new Date('2026-10-20T10:00:00Z'))).toBe(2);
    expect(getChallengeNumber(new Date('2026-10-27T10:00:00Z'))).toBe(9);
  });

  it('changes at midnight in Madrid, not in UTC', () => {
    // 23:30 on 19 October in Madrid
    expect(getChallengeNumber(new Date('2026-10-19T21:30:00Z'))).toBe(1);
    // 00:30 on 20 October in Madrid, still the 19th in UTC
    expect(getChallengeNumber(new Date('2026-10-19T22:30:00Z'))).toBe(2);
  });

  it('does not skip or repeat a number when the clocks change', () => {
    // The clocks go back on 25 October 2026, so that day has 25 hours.
    expect(getChallengeNumber(new Date('2026-10-24T22:30:00Z'))).toBe(7);
    expect(getChallengeNumber(new Date('2026-10-25T23:30:00Z'))).toBe(8);
  });

  it('keeps counting months later', () => {
    // 1 January 2027 in Madrid: 13 days of October + 30 + 31 = 74 days later
    expect(getChallengeNumber(new Date('2027-01-01T10:00:00Z'))).toBe(75);
  });
});
