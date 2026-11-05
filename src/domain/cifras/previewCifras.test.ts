import { describe, expect, it } from 'vitest';
import { gameReducer, initialState } from './gameCifras';
import { previewOperation } from './previewCifras';
import type { Challenge, GameState, Operator } from './typesCifras';

const challenge: Challenge = { numbers: [100, 75, 50, 25, 8, 3], target: 325 };

function idOf(state: GameState, value: number): number {
  const tile = state.tiles.find((tile) => tile.value === value);
  if (!tile) {
    throw new Error(`No tile with value ${value}`);
  }
  return tile.id;
}

// Selects a tile and an operator, like the player would before choosing the second tile.
function choose(state: GameState, a: number, operator: Operator): GameState {
  const withFirst = gameReducer(state, { type: 'selectTile', id: idOf(state, a) });
  return gameReducer(withFirst, { type: 'selectOperator', operator });
}

describe('previewOperation', () => {
  it('returns null when no tile is selected', () => {
    const state = initialState(challenge);

    expect(previewOperation(state, idOf(state, 75))).toBeNull();
  });

  it('returns null when a tile is selected but no operator', () => {
    const start = initialState(challenge);
    const state = gameReducer(start, { type: 'selectTile', id: idOf(start, 100) });

    expect(previewOperation(state, idOf(state, 75))).toBeNull();
  });

  it('returns null for the selected tile itself', () => {
    const state = choose(initialState(challenge), 100, '+');

    expect(previewOperation(state, idOf(state, 100))).toBeNull();
  });

  it('returns null for a tile that is not on the board', () => {
    const state = choose(initialState(challenge), 100, '+');

    expect(previewOperation(state, 999)).toBeNull();
  });

  it('gives the result of the operation with the other tile', () => {
    const state = choose(initialState(challenge), 100, '+');

    expect(previewOperation(state, idOf(state, 75))).toEqual({ ok: true, value: 175 });
  });

  it('uses the selected tile on the left', () => {
    const state = choose(initialState(challenge), 100, '-');

    expect(previewOperation(state, idOf(state, 25))).toEqual({ ok: true, value: 75 });
  });

  it('says why a subtraction is not allowed', () => {
    const state = choose(initialState(challenge), 25, '-');

    expect(previewOperation(state, idOf(state, 75))).toEqual({ ok: false, reason: 'not-positive' });
  });

  it('says why a division is not allowed', () => {
    const state = choose(initialState(challenge), 100, '÷');

    expect(previewOperation(state, idOf(state, 3))).toEqual({ ok: false, reason: 'not-exact' });
  });

  it('does not change the state', () => {
    const state = choose(initialState(challenge), 100, '+');
    const copy = structuredClone(state);

    previewOperation(state, idOf(state, 75));

    expect(state).toEqual(copy);
  });

  it('returns null once the game is finished', () => {
    const chosen = choose(initialState(challenge), 100, '+');
    const state = { ...chosen, finished: true };

    expect(previewOperation(state, idOf(state, 75))).toBeNull();
  });
});
