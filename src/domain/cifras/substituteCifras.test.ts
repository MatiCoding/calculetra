import { describe, expect, it } from 'vitest';
import { gameReducer, initialState } from './gameCifras';
import type { Challenge, GameState, Operator } from './typesCifras';

const challenge: Challenge = { numbers: [100, 75, 50, 25, 8, 3], target: 325 };

function values(state: GameState): number[] {
  return state.tiles.map((tile) => tile.value);
}

function idOf(state: GameState, value: number): number {
  const tile = state.tiles.find((tile) => tile.value === value);
  if (!tile) {
    throw new Error(`No tile with value ${value}`);
  }
  return tile.id;
}

function play(state: GameState, a: number, operator: Operator, b: number): GameState {
  const withFirst = gameReducer(state, { type: 'selectTile', id: idOf(state, a) });
  const withOperator = gameReducer(withFirst, { type: 'selectOperator', operator });
  return gameReducer(withOperator, { type: 'selectTile', id: idOf(withOperator, b) });
}

function steps(state: GameState) {
  return state.steps.map(({ left, operator, right, result }) => [
    left.value,
    operator,
    right.value,
    result.value,
  ]);
}

// The id of a starting number, by its value in the challenge.
function startingId(value: number): number {
  return challenge.numbers.indexOf(value);
}

// Swaps the starting number `oldValue`, used in the tree, for the free starting number `newValue`.
function swap(state: GameState, oldValue: number, newValue: number): GameState {
  return gameReducer(state, {
    type: 'substitute',
    oldTileId: startingId(oldValue),
    newTileId: startingId(newValue),
  });
}

describe('substitute', () => {
  it('puts the new number in the step and calculates it again', () => {
    const played = play(initialState(challenge), 100, '+', 75);
    const state = swap(played, 75, 25);

    expect(steps(state)).toEqual([[100, '+', 25, 125]]);
  });

  it('puts the old number back on the board, in its place', () => {
    const played = play(initialState(challenge), 100, '+', 75);
    const state = swap(played, 75, 25);

    expect(values(state)).toEqual([75, 50, 8, 3, 125]);
  });

  it('keeps the id of each result', () => {
    const played = play(initialState(challenge), 100, '+', 75);
    const state = swap(played, 75, 25);

    expect(state.steps[0].result.id).toBe(played.steps[0].result.id);
  });

  it('calculates again every step that depends on the swapped number', () => {
    const first = play(initialState(challenge), 100, '+', 75);
    const second = play(first, 175, '×', 3);
    const state = swap(second, 75, 50);

    expect(steps(state)).toEqual([
      [100, '+', 50, 150],
      [150, '×', 3, 450],
    ]);
    expect(values(state)).toEqual([75, 25, 8, 450]);
  });

  it('leaves the steps that do not depend on it as they were', () => {
    const first = play(initialState(challenge), 100, '+', 75);
    const second = play(first, 8, '×', 3);
    const state = swap(second, 75, 50);

    expect(steps(state)).toEqual([
      [100, '+', 50, 150],
      [8, '×', 3, 24],
    ]);
  });

  it('can swap the number on the left too', () => {
    const played = play(initialState(challenge), 100, '+', 75);
    const state = swap(played, 100, 50);

    expect(steps(state)).toEqual([[50, '+', 75, 125]]);
    expect(values(state)).toEqual([100, 25, 8, 3, 125]);
  });

  it('clears the selection and the error', () => {
    const played = play(initialState(challenge), 100, '+', 75);
    const selected = gameReducer(played, { type: 'selectTile', id: startingId(25) });
    const state = swap(selected, 75, 25);

    expect(state.selectedId).toBeNull();
    expect(state.operator).toBeNull();
    expect(state.error).toBeNull();
    expect(state.substituteError).toBeNull();
  });

  it('changes nothing and says why when a step stops being positive', () => {
    const played = play(initialState(challenge), 50, '-', 25);
    const state = swap(played, 25, 75);

    expect(values(state)).toEqual(values(played));
    expect(state.steps).toEqual(played.steps);
    expect(state.substituteError).toEqual({ value: 75, reason: 'not-positive' });
  });

  it('changes nothing and says why when a division stops being exact', () => {
    const played = play(initialState(challenge), 75, '÷', 25);
    const state = swap(played, 25, 8);

    expect(values(state)).toEqual(values(played));
    expect(state.steps).toEqual(played.steps);
    expect(state.substituteError).toEqual({ value: 8, reason: 'not-exact' });
  });

  it('fails if a later step stops being valid, even if the first one is fine', () => {
    // 100 + 75 = 175 and 50 × 3 = 150, then 175 − 150 = 25.
    // With 8 instead of 75: 100 + 8 = 108 is fine, but 108 − 150 is not allowed.
    const first = play(initialState(challenge), 100, '+', 75);
    const second = play(first, 50, '×', 3);
    const third = play(second, 175, '-', 150);
    const state = swap(third, 75, 8);

    expect(state.steps).toEqual(third.steps);
    expect(state.substituteError).toEqual({ value: 8, reason: 'not-positive' });
  });

  it('forgets the failed swap when the player does something else', () => {
    const played = play(initialState(challenge), 50, '-', 25);
    const failed = swap(played, 25, 75);
    const state = gameReducer(failed, { type: 'selectTile', id: startingId(100) });

    expect(state.substituteError).toBeNull();
  });

  it('ends the game when a new result is the target', () => {
    // 300 + 75 = 375; swapping 75 for 25 gives 325, the target.
    const first = play(initialState(challenge), 100, '×', 3);
    const second = play(first, 300, '+', 75);
    const state = swap(second, 75, 25);

    expect(steps(state)).toEqual([
      [100, '×', 3, 300],
      [300, '+', 25, 325],
    ]);
    expect(state.finished).toBe(true);
  });

  it('does not end the game when no result is the target', () => {
    const played = play(initialState(challenge), 100, '+', 75);

    expect(swap(played, 75, 25).finished).toBe(false);
  });

  it('does nothing if the old number is not used in the tree', () => {
    const played = play(initialState(challenge), 100, '+', 75);

    expect(swap(played, 50, 25)).toBe(played);
  });

  it('does nothing if the new number is not free on the board', () => {
    const played = play(initialState(challenge), 100, '+', 75);

    expect(swap(played, 75, 100)).toBe(played);
  });

  it('does not swap calculated results', () => {
    const first = play(initialState(challenge), 100, '+', 75);
    const second = play(first, 50, '+', 25);
    const result175 = idOf(second, 175);
    const result75 = idOf(second, 75);

    // A result cannot be the new number...
    expect(
      gameReducer(second, { type: 'substitute', oldTileId: startingId(100), newTileId: result75 }),
    ).toBe(second);
    // ...nor the number that is swapped.
    expect(
      gameReducer(first, { type: 'substitute', oldTileId: result175, newTileId: startingId(50) }),
    ).toBe(first);
  });

  it('does nothing once the game is finished', () => {
    const played = play(initialState(challenge), 100, '+', 75);
    const finished = gameReducer(played, { type: 'finish' });

    expect(swap(finished, 75, 25)).toBe(finished);
  });

  it('does not change the previous state', () => {
    const played = play(initialState(challenge), 100, '+', 75);
    const copy = structuredClone(played);

    swap(played, 75, 25);

    expect(played).toEqual(copy);
  });
});
