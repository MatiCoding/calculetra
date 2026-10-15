import { describe, expect, it } from 'vitest';
import { gameReducer, initialState } from './game';
import { calculateScore, getBestValue } from './score';
import type { Challenge, GameState, Operator } from './types';

const challenge: Challenge = { numbers: [100, 75, 50, 25, 8, 3], target: 325 };

function idOf(state: GameState, value: number): number {
  const tile = state.tiles.find((tile) => tile.value === value);
  if (!tile) {
    throw new Error(`No tile with value ${value}`);
  }
  return tile.id;
}

function play(
  state: GameState,
  a: number,
  operator: Operator,
  b: number,
): GameState {
  const withFirst = gameReducer(state, { type: 'selectTile', id: idOf(state, a) });
  const withOperator = gameReducer(withFirst, { type: 'selectOperator', operator });
  return gameReducer(withOperator, { type: 'selectTile', id: idOf(withOperator, b) });
}

describe('getBestValue', () => {
  it('returns the number on the board closest to the target', () => {
    // 100, 75, 50, 25, 8, 3: the closest to 325 is 100
    expect(getBestValue(initialState(challenge))).toBe(100);
  });

  it('uses the results of the operations', () => {
    const state = play(initialState(challenge), 100, '×', 3);

    expect(getBestValue(state)).toBe(300);
  });

  it('can be above the target', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const state = play(first, 300, '+', 50);

    // 350 (25 away) is closer than 75 or 25
    expect(getBestValue(state)).toBe(350);
  });

  it('returns the target when it was reached', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const state = play(first, 300, '+', 25);

    expect(getBestValue(state)).toBe(325);
  });

  it('picks the smaller number when two are equally close', () => {
    const state = initialState({ numbers: [320, 330, 1, 2, 3, 4], target: 325 });

    expect(getBestValue(state)).toBe(320);
  });
});

describe('calculateScore', () => {
  it('gives 10 points for the exact target', () => {
    expect(calculateScore(325, 325)).toBe(10);
  });

  it('gives 7 points from 1 to 5 away', () => {
    expect(calculateScore(325, 324)).toBe(7);
    expect(calculateScore(325, 330)).toBe(7);
    expect(calculateScore(325, 320)).toBe(7);
  });

  it('gives 5 points from 6 to 10 away', () => {
    expect(calculateScore(325, 331)).toBe(5);
    expect(calculateScore(325, 315)).toBe(5);
  });

  it('gives 0 points when more than 10 away', () => {
    expect(calculateScore(325, 336)).toBe(0);
    expect(calculateScore(325, 314)).toBe(0);
    expect(calculateScore(325, 100)).toBe(0);
  });
});
