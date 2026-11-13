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

describe('undoTo', () => {
  it('undoes the step that made the result', () => {
    const played = play(initialState(challenge), 100, '×', 3);
    const state = gameReducer(played, { type: 'undoTo', resultId: idOf(played, 300) });

    expect(values(state)).toEqual([100, 75, 50, 25, 8, 3]);
    expect(state.steps).toEqual([]);
  });

  it('also undoes the steps that used the result, directly or not', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const second = play(first, 300, '-', 75);
    const third = play(second, 225, '+', 50);
    const state = gameReducer(third, { type: 'undoTo', resultId: idOf(first, 300) });

    expect(values(state)).toEqual([100, 75, 50, 25, 8, 3]);
    expect(state.steps).toEqual([]);
  });

  it('keeps the steps that made the numbers the result was made from', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const second = play(first, 300, '-', 75);
    const state = gameReducer(second, { type: 'undoTo', resultId: idOf(second, 225) });

    expect(values(state)).toEqual(values(first));
    expect(steps(state)).toEqual(steps(first));
  });

  it('keeps the other branches, even if they were made later', () => {
    // 50 + 8 does not use the 300, so it stays.
    const first = play(initialState(challenge), 100, '×', 3);
    const second = play(first, 50, '+', 8);
    const third = play(second, 300, '-', 75);
    const state = gameReducer(third, { type: 'undoTo', resultId: idOf(first, 300) });

    expect(values(state)).toEqual([100, 75, 25, 3, 58]);
    expect(steps(state)).toEqual([[50, '+', 8, 58]]);
  });

  it('clears the selection and the error', () => {
    const played = play(initialState(challenge), 100, '×', 3);
    const selected = gameReducer(played, { type: 'selectTile', id: idOf(played, 75) });
    const state = gameReducer(selected, { type: 'undoTo', resultId: idOf(played, 300) });

    expect(state.selectedId).toBeNull();
    expect(state.operator).toBeNull();
    expect(state.error).toBeNull();
  });

  it('does nothing if no step made that tile', () => {
    const played = play(initialState(challenge), 100, '×', 3);

    // The 75 is a starting number, not the result of a step.
    expect(gameReducer(played, { type: 'undoTo', resultId: idOf(played, 75) })).toBe(played);
    expect(gameReducer(played, { type: 'undoTo', resultId: 999 })).toBe(played);
  });

  it('does nothing once the game is finished', () => {
    const played = play(initialState(challenge), 100, '×', 3);
    const finished = gameReducer(played, { type: 'finish' });

    expect(gameReducer(finished, { type: 'undoTo', resultId: idOf(played, 300) })).toBe(finished);
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

describe('hint', () => {
  function hint(state: GameState, left: number, operator: Operator, right: number): GameState {
    return gameReducer(state, { type: 'hint', step: { left, operator, right } });
  }

  it('does the operation on the board, like the player would', () => {
    const state = hint(initialState(challenge), 100, '×', 3);

    expect(steps(state)).toEqual([[100, '×', 3, 300]]);
    expect(values(state)).toEqual([75, 50, 25, 8, 300]);
  });

  it('marks the step as done by a hint and counts the hint', () => {
    const state = hint(initialState(challenge), 100, '×', 3);

    expect(state.steps[0].byHint).toBe(true);
    expect(state.hintsUsed).toBe(1);
  });

  it('marks the player steps as not done by a hint', () => {
    const state = play(initialState(challenge), 100, '×', 3);

    expect(state.steps[0].byHint).toBe(false);
    expect(state.hintsUsed).toBe(0);
  });

  it('can use a result the player made', () => {
    const withPlayerStep = play(initialState(challenge), 100, '×', 3);
    const state = hint(withPlayerStep, 300, '+', 25);

    expect(steps(state)).toEqual([
      [100, '×', 3, 300],
      [300, '+', 25, 325],
    ]);
  });

  it('finishes the game when the hint reaches the target', () => {
    const state = hint(hint(initialState(challenge), 100, '×', 3), 300, '+', 25);

    expect(state.finished).toBe(true);
  });

  it('uses two different tiles when both numbers are the same', () => {
    const twins: Challenge = { numbers: [5, 5, 1, 2, 3, 4], target: 999 };
    const state = hint(initialState(twins), 5, '×', 5);

    expect(steps(state)).toEqual([[5, '×', 5, 25]]);
  });

  it('does nothing when a number is not on the board', () => {
    const before = initialState(challenge);
    const after = hint(before, 999, '+', 3);

    expect(after).toBe(before);
  });

  it('does not count a hint whose operation breaks the rules', () => {
    const state = hint(initialState(challenge), 3, '-', 8);

    expect(state.steps).toEqual([]);
    expect(state.hintsUsed).toBe(0);
  });
});

describe('undoPlayerSteps', () => {
  function hint(state: GameState, left: number, operator: Operator, right: number): GameState {
    return gameReducer(state, { type: 'hint', step: { left, operator, right } });
  }

  it('undoes the player steps and keeps the hint steps', () => {
    const withHint = hint(initialState(challenge), 100, '×', 3);
    const withPlayer = play(withHint, 75, '-', 50);

    const state = gameReducer(withPlayer, { type: 'undoPlayerSteps' });

    expect(steps(state)).toEqual([[100, '×', 3, 300]]);
    expect(values(state)).toEqual([75, 50, 25, 8, 300]);
  });

  it('also undoes a hint step that was built on a player step', () => {
    const withPlayer = play(initialState(challenge), 100, '×', 3);
    const withHint = hint(withPlayer, 300, '-', 75);

    const state = gameReducer(withHint, { type: 'undoPlayerSteps' });

    expect(state.steps).toEqual([]);
    expect(values(state)).toEqual([100, 75, 50, 25, 8, 3]);
  });

  it('keeps the hints paid', () => {
    const withPlayer = play(initialState(challenge), 100, '×', 3);
    const withHint = hint(withPlayer, 300, '-', 75);

    expect(gameReducer(withHint, { type: 'undoPlayerSteps' }).hintsUsed).toBe(1);
  });

  it('does nothing when the player has no steps', () => {
    const before = hint(initialState(challenge), 100, '×', 3);

    expect(steps(gameReducer(before, { type: 'undoPlayerSteps' }))).toEqual(steps(before));
  });
});

describe('reset with hints', () => {
  it('starts the board again but keeps the hints paid', () => {
    const withHint = gameReducer(initialState(challenge), { type: 'hint', step: { left: 100, operator: '×', right: 3 } });

    const state = gameReducer(withHint, { type: 'reset' });

    expect(state.steps).toEqual([]);
    expect(values(state)).toEqual([100, 75, 50, 25, 8, 3]);
    expect(state.hintsUsed).toBe(1);
  });
});

describe('the paid hints', () => {
  function hint(state: GameState, left: number, operator: Operator, right: number): GameState {
    return gameReducer(state, { type: 'hint', step: { left, operator, right } });
  }

  it('keeps the operation of each hint, in order', () => {
    const state = hint(hint(initialState(challenge), 100, '×', 3), 300, '+', 25);

    expect(state.hints).toEqual([
      { left: 100, operator: '×', right: 3 },
      { left: 300, operator: '+', right: 25 },
    ]);
  });

  it('does not keep a hint that was not done', () => {
    expect(hint(initialState(challenge), 3, '-', 8).hints).toEqual([]);
  });

  it('keeps them after a reset', () => {
    const withHint = hint(initialState(challenge), 100, '×', 3);

    expect(gameReducer(withHint, { type: 'reset' }).hints).toEqual(withHint.hints);
  });
});

describe('removeHints', () => {
  function hint(state: GameState, left: number, operator: Operator, right: number): GameState {
    return gameReducer(state, { type: 'hint', step: { left, operator, right } });
  }

  it('undoes the hint steps and keeps the player steps', () => {
    const withHint = hint(initialState(challenge), 100, '×', 3);
    const withPlayer = play(withHint, 75, '-', 50);

    const state = gameReducer(withPlayer, { type: 'removeHints' });

    expect(steps(state)).toEqual([[75, '-', 50, 25]]);
    expect(values(state)).toEqual([100, 25, 8, 3, 25]);
  });

  it('also undoes a player step that was built on a hint step', () => {
    const withHint = hint(initialState(challenge), 100, '×', 3);
    const withPlayer = play(withHint, 300, '-', 75);

    const state = gameReducer(withPlayer, { type: 'removeHints' });

    expect(state.steps).toEqual([]);
    expect(values(state)).toEqual([100, 75, 50, 25, 8, 3]);
  });

  it('keeps the hints paid', () => {
    const withHint = hint(initialState(challenge), 100, '×', 3);
    const state = gameReducer(withHint, { type: 'removeHints' });

    expect(state.hintsUsed).toBe(1);
    expect(state.hints).toEqual(withHint.hints);
  });
});

describe('showHints', () => {
  function hint(state: GameState, left: number, operator: Operator, right: number): GameState {
    return gameReducer(state, { type: 'hint', step: { left, operator, right } });
  }

  it('puts the hints back on the board after a reset', () => {
    const withHints = hint(hint(initialState(challenge), 100, '×', 3), 75, '-', 50);
    const reset = gameReducer(withHints, { type: 'reset' });

    const state = gameReducer(reset, { type: 'showHints' });

    expect(steps(state)).toEqual(steps(withHints));
    expect(state.steps.every((step) => step.byHint)).toBe(true);
  });

  it('undoes the player steps', () => {
    const withHint = hint(initialState(challenge), 100, '×', 3);
    const removed = gameReducer(withHint, { type: 'removeHints' });
    const withPlayer = play(removed, 75, '+', 50);

    const state = gameReducer(withPlayer, { type: 'showHints' });

    expect(steps(state)).toEqual([[100, '×', 3, 300]]);
    expect(values(state)).toEqual([75, 50, 25, 8, 300]);
  });

  it('does not charge the hints again', () => {
    const withHint = hint(initialState(challenge), 100, '×', 3);
    const reset = gameReducer(withHint, { type: 'reset' });

    const state = gameReducer(reset, { type: 'showHints' });

    expect(state.hintsUsed).toBe(1);
    expect(state.hints).toEqual(withHint.hints);
  });

  it('skips a hint that was built on a player step', () => {
    // The 300 was the player's, so 300 + 25 can not be done again from the start.
    const withPlayer = play(initialState(challenge), 100, '×', 3);
    const withHint = hint(withPlayer, 300, '+', 25);
    const reset = gameReducer(withHint, { type: 'reset' });

    const state = gameReducer(reset, { type: 'showHints' });

    expect(state.steps).toEqual([]);
    expect(state.hintsUsed).toBe(1);
  });

  it('does nothing once the game is finished', () => {
    const withHint = hint(initialState(challenge), 100, '×', 3);
    const removed = gameReducer(withHint, { type: 'removeHints' });
    const finished = gameReducer(removed, { type: 'finish' });

    expect(gameReducer(finished, { type: 'showHints' })).toBe(finished);
  });
});
