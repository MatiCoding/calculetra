import { describe, expect, it } from 'vitest';
import { gameReducer, getWord, initialState, isPicked } from './gameLetras';
import type { GameState } from './typesLetras';

const LETTERS = ['P', 'A', 'O', 'H', 'C', 'I', 'E', 'A', 'L'];

function pick(state: GameState, ...ids: Array<number>): GameState {
  return ids.reduce((current, id) => gameReducer(current, { type: 'pick', id }), state);
}

describe('initialState', () => {
  it('turns each letter into a tile with its own id', () => {
    const state = initialState(LETTERS);

    expect(state.tiles).toHaveLength(9);
    expect(state.tiles[0]).toEqual({ id: 0, letter: 'P' });
    expect(state.tiles[8]).toEqual({ id: 8, letter: 'L' });
  });

  it('starts with no letters picked and no result', () => {
    const state = initialState(LETTERS);

    expect(state.picked).toEqual([]);
    expect(state.result).toBeNull();
    expect(getWord(state)).toBe('');
  });

  it('gives different ids to repeated letters', () => {
    const state = initialState(LETTERS);
    const as = state.tiles.filter((tile) => tile.letter === 'A');

    expect(as).toHaveLength(2);
    expect(as[0].id).not.toBe(as[1].id);
  });
});

describe('pick', () => {
  it('adds the letter to the end of the word', () => {
    // C H A P E L A
    const state = pick(initialState(LETTERS), 4, 3, 1, 0, 6, 8, 7);

    expect(getWord(state)).toBe('CHAPELA');
  });

  it('marks the tile as picked', () => {
    const state = pick(initialState(LETTERS), 4);

    expect(isPicked(state, 4)).toBe(true);
    expect(isPicked(state, 3)).toBe(false);
  });

  it('does not pick the same tile twice', () => {
    const state = pick(initialState(LETTERS), 0, 0);

    expect(getWord(state)).toBe('P');
  });

  it('lets the player use a repeated letter once per tile', () => {
    const state = pick(initialState(LETTERS), 1, 7);

    expect(getWord(state)).toBe('AA');
  });

  it('ignores a tile that does not exist', () => {
    const before = initialState(LETTERS);

    expect(pick(before, 42)).toBe(before);
  });
});

describe('removeLast', () => {
  it('removes the last letter and makes its tile available again', () => {
    const state = gameReducer(pick(initialState(LETTERS), 0, 1, 2), { type: 'removeLast' });

    expect(getWord(state)).toBe('PA');
    expect(isPicked(state, 2)).toBe(false);
  });

  it('does nothing when the word is empty', () => {
    const state = gameReducer(initialState(LETTERS), { type: 'removeLast' });

    expect(getWord(state)).toBe('');
  });
});

describe('clear', () => {
  it('empties the word and frees every tile', () => {
    const state = gameReducer(pick(initialState(LETTERS), 0, 1, 2), { type: 'clear' });

    expect(getWord(state)).toBe('');
    expect(state.tiles.every((tile) => !isPicked(state, tile.id))).toBe(true);
  });
});

describe('gameReducer', () => {
  it('does not change the state it is given', () => {
    const before = initialState(LETTERS);
    pick(before, 0, 1);

    expect(before.picked).toEqual([]);
  });
});

describe('type', () => {
  function type(state: GameState, text: string): GameState {
    return [...text].reduce((current, letter) => gameReducer(current, { type: 'type', letter }), state);
  }

  it('picks the tile with the typed letter', () => {
    const state = type(initialState(LETTERS), 'CHAPELA');

    expect(getWord(state)).toBe('CHAPELA');
  });

  it('accepts lower case and accented letters', () => {
    const state = type(initialState(LETTERS), 'pé');

    expect(getWord(state)).toBe('PE');
  });

  it('uses the next free tile when a letter is repeated', () => {
    const state = type(initialState(LETTERS), 'AA');

    expect(state.picked).toEqual([1, 7]);
  });

  it('ignores a letter that is not available', () => {
    const before = type(initialState(LETTERS), 'P');

    expect(type(before, 'Z')).toBe(before);
    expect(type(before, 'P')).toBe(before);
  });

  it('ignores keys that are not letters', () => {
    const before = initialState(LETTERS);

    expect(type(before, '1')).toBe(before);
  });
});

describe('submit', () => {
  const dictionary = new Set(['CHAPELA', 'ALOPECIA']);

  function submit(state: GameState): GameState {
    return gameReducer(state, { type: 'submit', dictionary });
  }

  it('gives one point per letter for a word in the dictionary', () => {
    // C H A P E L A
    const state = submit(pick(initialState(LETTERS), 4, 3, 1, 0, 6, 8, 7));

    expect(state.result).toEqual({ word: 'CHAPELA', isValid: true, score: 7 });
  });

  it('gives 0 points for a word that is not in the dictionary', () => {
    // P A L O H C I E A
    const state = submit(pick(initialState(LETTERS), 0, 1, 8, 2, 3, 4, 5, 6, 7));

    expect(state.result).toEqual({ word: 'PALOHCIEA', isValid: false, score: 0 });
  });

  it('does not send a word shorter than 3 letters', () => {
    const before = pick(initialState(LETTERS), 0, 1);

    expect(submit(before)).toBe(before);
    expect(submit(before).result).toBeNull();
  });

  it('ends the game: nothing changes after sending', () => {
    const finished = submit(pick(initialState(LETTERS), 4, 3, 1, 0, 6, 8, 7));

    expect(gameReducer(finished, { type: 'removeLast' })).toBe(finished);
    expect(gameReducer(finished, { type: 'clear' })).toBe(finished);
    expect(gameReducer(finished, { type: 'pick', id: 2 })).toBe(finished);
    expect(submit(finished)).toBe(finished);
  });
});
