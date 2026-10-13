import { describe, expect, it } from 'vitest';
import { gameReducer, initialState } from './game';
import type { Challenge, GameState, Operator } from './types';

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

// Select a tile, an operator and another tile, like the player would.
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

function steps(state: GameState) {
  return state.steps.map(({ left, operator, right, result }) => [
    left.value,
    operator,
    right.value,
    result.value,
  ]);
}

describe('initialState', () => {
  it('starts with the numbers of the challenge and nothing selected', () => {
    const state = initialState(challenge);

    expect(state.challenge).toEqual(challenge);
    expect(values(state)).toEqual([100, 75, 50, 25, 8, 3]);
    expect(state.steps).toEqual([]);
    expect(state.selectedId).toBeNull();
    expect(state.operator).toBeNull();
    expect(state.error).toBeNull();
    expect(state.finished).toBe(false);
  });

  it('gives each tile a different id, even with repeated numbers', () => {
    const state = initialState({ numbers: [5, 5, 1, 1, 25, 100], target: 500 });
    const ids = state.tiles.map((tile) => tile.id);

    expect(new Set(ids).size).toBe(6);
  });
});

describe('selectTile', () => {
  it('selects a tile', () => {
    const start = initialState(challenge);
    const state = gameReducer(start, { type: 'selectTile', id: idOf(start, 75) });

    expect(state.selectedId).toBe(idOf(start, 75));
  });

  it('deselects the tile when it is selected again', () => {
    const start = initialState(challenge);
    const id = idOf(start, 75);
    const selected = gameReducer(start, { type: 'selectTile', id });

    expect(gameReducer(selected, { type: 'selectTile', id }).selectedId).toBeNull();
  });

  it('moves the selection to another tile if there is no operator yet', () => {
    const start = initialState(challenge);
    const first = gameReducer(start, { type: 'selectTile', id: idOf(start, 75) });
    const second = gameReducer(first, { type: 'selectTile', id: idOf(start, 8) });

    expect(second.selectedId).toBe(idOf(start, 8));
  });
});

describe('selectOperator', () => {
  it('selects an operator when a tile is selected', () => {
    const start = initialState(challenge);
    const selected = gameReducer(start, { type: 'selectTile', id: idOf(start, 75) });
    const state = gameReducer(selected, { type: 'selectOperator', operator: '×' });

    expect(state.operator).toBe('×');
  });

  it('changes the operator if one was already selected', () => {
    const start = initialState(challenge);
    const selected = gameReducer(start, { type: 'selectTile', id: idOf(start, 75) });
    const times = gameReducer(selected, { type: 'selectOperator', operator: '×' });
    const plus = gameReducer(times, { type: 'selectOperator', operator: '+' });

    expect(plus.operator).toBe('+');
  });

  it('does nothing if no tile is selected', () => {
    const start = initialState(challenge);

    expect(gameReducer(start, { type: 'selectOperator', operator: '+' })).toBe(start);
  });
});

describe('combining two tiles', () => {
  it('replaces both tiles with the result at the end', () => {
    const state = play(initialState(challenge), 100, '×', 3);

    expect(values(state)).toEqual([75, 50, 25, 8, 300]);
    expect(steps(state)).toEqual([[100, '×', 3, 300]]);
    expect(state.selectedId).toBeNull();
    expect(state.operator).toBeNull();
  });

  it('lets the result be used again', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const second = play(first, 300, '-', 75);

    expect(values(second)).toEqual([50, 25, 8, 225]);
    expect(steps(second)).toEqual([
      [100, '×', 3, 300],
      [300, '-', 75, 225],
    ]);
  });

  it('gives the result an id that no other tile has', () => {
    const state = play(initialState(challenge), 100, '×', 3);
    const ids = state.tiles.map((tile) => tile.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('works with two tiles of the same value', () => {
    const start = initialState({ numbers: [5, 5, 1, 2, 25, 100], target: 500 });
    const [firstFive, secondFive] = start.tiles;

    const selected = gameReducer(start, { type: 'selectTile', id: firstFive.id });
    const withOperator = gameReducer(selected, { type: 'selectOperator', operator: '+' });
    const state = gameReducer(withOperator, { type: 'selectTile', id: secondFive.id });

    expect(values(state)).toEqual([1, 2, 25, 100, 10]);
  });

  it('rejects a subtraction that is not positive and keeps the tiles', () => {
    const state = play(initialState(challenge), 3, '-', 100);

    expect(state.error).toBe('not-positive');
    expect(values(state)).toEqual([100, 75, 50, 25, 8, 3]);
    expect(state.steps).toEqual([]);
    expect(state.selectedId).toBeNull();
    expect(state.operator).toBeNull();
  });

  it('rejects a division that is not exact', () => {
    const state = play(initialState(challenge), 75, '÷', 8);

    expect(state.error).toBe('not-exact');
    expect(values(state)).toEqual([100, 75, 50, 25, 8, 3]);
  });

  it('clears the error when the player selects a tile again', () => {
    const failed = play(initialState(challenge), 75, '÷', 8);
    const state = gameReducer(failed, { type: 'selectTile', id: idOf(failed, 50) });

    expect(state.error).toBeNull();
  });

  it('does not finish if the result is not the target', () => {
    expect(play(initialState(challenge), 100, '×', 3).finished).toBe(false);
  });

  it('finishes on its own when the result is the target', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const state = play(first, 300, '+', 25);

    expect(values(state)).toContain(325);
    expect(state.finished).toBe(true);
  });
});

describe('undo', () => {
  it('restores the two tiles of the last step in their original order', () => {
    const played = play(initialState(challenge), 100, '×', 3);
    const state = gameReducer(played, { type: 'undo' });

    expect(values(state)).toEqual([100, 75, 50, 25, 8, 3]);
    expect(state.steps).toEqual([]);
  });

  it('only undoes the last step', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const second = play(first, 300, '-', 75);
    const state = gameReducer(second, { type: 'undo' });

    expect(values(state)).toEqual(values(first));
    expect(steps(state)).toEqual(steps(first));
  });

  it('clears the selection and the error', () => {
    const played = play(initialState(challenge), 100, '×', 3);
    const selected = gameReducer(played, { type: 'selectTile', id: idOf(played, 75) });
    const state = gameReducer(selected, { type: 'undo' });

    expect(state.selectedId).toBeNull();
    expect(state.operator).toBeNull();
    expect(state.error).toBeNull();
  });

  it('does nothing if there are no steps', () => {
    const start = initialState(challenge);

    expect(gameReducer(start, { type: 'undo' })).toBe(start);
  });
});

describe('reset', () => {
  it('goes back to the start', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const second = play(first, 300, '-', 75);

    expect(gameReducer(second, { type: 'reset' })).toEqual(initialState(challenge));
  });
});

describe('finish', () => {
  it('finishes the game and clears the selection', () => {
    const start = initialState(challenge);
    const selected = gameReducer(start, { type: 'selectTile', id: idOf(start, 75) });
    const state = gameReducer(selected, { type: 'finish' });

    expect(state.finished).toBe(true);
    expect(state.selectedId).toBeNull();
    expect(state.operator).toBeNull();
  });

  it('ignores selections and undo once the game is finished', () => {
    const played = play(initialState(challenge), 100, '×', 3);
    const finished = gameReducer(played, { type: 'finish' });

    expect(gameReducer(finished, { type: 'selectTile', id: idOf(finished, 75) })).toBe(finished);
    expect(gameReducer(finished, { type: 'undo' })).toBe(finished);
  });

  it('can still be reset after finishing', () => {
    const finished = gameReducer(initialState(challenge), { type: 'finish' });

    expect(gameReducer(finished, { type: 'reset' })).toEqual(initialState(challenge));
  });
});

describe('immutability', () => {
  it('does not change the previous state', () => {
    const start = initialState(challenge);
    const copy = structuredClone(start);

    const first = play(start, 100, '×', 3);
    gameReducer(first, { type: 'undo' });

    expect(start).toEqual(copy);
    expect(steps(first)).toEqual([[100, '×', 3, 300]]);
  });
});
