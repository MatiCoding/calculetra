import { describe, expect, it } from 'vitest';
import { getActiveIndex } from './carousel';

// Three cards 300 px wide with a gap of 20 px. The centre of each card is
// at 150, 470 and 790.
const cards = [
  { left: 0, width: 300 },
  { left: 320, width: 300 },
  { left: 640, width: 300 },
];

describe('getActiveIndex', () => {
  it('is the first card when the track has not moved', () => {
    // A track 300 px wide: its centre is at 150, the centre of the first card.
    expect(getActiveIndex(0, 300, cards)).toBe(0);
  });

  it('is the card whose centre is in the centre of the track', () => {
    expect(getActiveIndex(320, 300, cards)).toBe(1);
    expect(getActiveIndex(640, 300, cards)).toBe(2);
  });

  it('is the closest card when the track is between two cards', () => {
    // Centre of the track at 100 + 150 = 250: 100 px from the first card
    // and 220 px from the second one.
    expect(getActiveIndex(100, 300, cards)).toBe(0);
    // Centre at 250 + 150 = 400: 70 px from the second card.
    expect(getActiveIndex(250, 300, cards)).toBe(1);
  });

  it('takes the width of the track into account', () => {
    // A track 940 px wide shows the three cards, and its centre is the second.
    expect(getActiveIndex(0, 940, cards)).toBe(1);
  });

  it('is 0 when there are no cards', () => {
    expect(getActiveIndex(0, 300, [])).toBe(0);
  });
});
