import type {GameAction, GameState } from './typesLetras';
import { isInDictionary } from './dictionaryLetras';
import { calculateScore } from './scoreLetras';
import { canSubmit, normalizeWord } from './wordLetras';

export function initialState(letters: Array<string>): GameState {
    return {
        tiles: letters.map((letter, index) => ({id: index, letter})),
        picked: [],
        result: null,
    };
}

export function getWord(state: GameState): string {
    return state.picked
        .map((id) => state.tiles.find((tile) => tile.id === id)?.letter ?? '')
        .join('');
}

export function isPicked(state:GameState, id: number): boolean {
    return state.picked.includes(id);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
    if (state.result !== null) return state;

    switch (action.type) {
        case 'pick': {
            const exists = state.tiles.some((tile) => tile.id === action.id);
            if (!exists || isPicked(state, action.id)) {
                return state;
            }
            return {...state, picked: [...state.picked, action.id]};
        }

        case 'removeLast':
            return {...state, picked: state.picked.slice(0, -1)};

        case 'clear':
            return {...state, picked: []};

        case 'type': {
            // Typing a letter picks the first free tile with that letter.
            const letter = normalizeWord(action.letter);
            const tile = state.tiles.find((t) => t.letter === letter && !isPicked(state, t.id));
            if (tile === undefined) {
                return state;
            }
            return { ...state, picked: [...state.picked, tile.id] };
        }

        case 'submit': {
            const word = getWord(state);
            const letters = state.tiles.map((tile) => tile.letter);
            if (!canSubmit(word, letters)) {
                return state;
            }
            const isValid = isInDictionary(word, action.dictionary);
            return { ...state, result: { word, isValid, score: calculateScore(word, isValid) } };
        }
        
        default: {
            const unexpected: never = action;
            throw new Error(`Unknown action: ${JSON.stringify(unexpected)}`);
        }
    }
}