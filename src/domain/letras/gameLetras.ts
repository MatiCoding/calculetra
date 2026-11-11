import type {GameAction, GameState } from './typesLetras';
import { isInDictionary } from './dictionaryLetras';
import { calculateScore, hintPenalty, scoreWithHints } from './scoreLetras';
import { canSubmit, normalizeWord } from './wordLetras';
import {MAX_HINTS_LETRAS} from './hintsLetras';

export function initialState(letters: Array<string>): GameState {
    return {
        tiles: letters.map((letter, index) => ({id: index, letter})),
        picked: [],
        hints: [],
        hintsShown: true,
        result: null,
    };
}

function letterOf(state: GameState, id: number): string{
    return state.tiles.find((tile) => tile.id === id)?.letter ?? '';
}

export function getSlots(state: GameState): Array<string | null> {
    const slots: Array<string | null> = state.tiles.map(() => null);
    if (state.hintsShown) {    
        for (const hint of state.hints) {
            slots[hint.position] = letterOf(state, hint.tileId);
        }
    }    
    let next = 0;
    for (let i = 0; i < slots.length && next < state.picked.length; i++){
        if (slots[i] === null) {
            slots[i] = letterOf(state, state.picked[next]);
            next++;
        }
    }
    return slots;
}

// The word on the board: the letters from the first slot up to the first empty one.
export function getWord(state: GameState): string {
    const slots = getSlots(state);
    const end = slots.indexOf(null);
    return slots.slice(0, end === -1 ? slots.length : end).join('');
}

export function isHint(state: GameState, id: number): boolean {
    return state.hints.some((hint) => hint.tileId === id);
}

// A tile is used if the player picked it or a hint on the board locked it.
export function isPicked(state:GameState, id: number): boolean {
    return state.picked.includes(id) || (state.hintsShown && isHint(state, id));
}

// Every hint letter on the board has to be part of the word. Hidden hints do not count.
export function usesAllHints(state: GameState): boolean {
    if (!state.hintsShown) return true;
    const length = getWord(state).length;
    return state.hints.every((hint) => hint.position < length);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
    // Playing again staarts over with the same letters. It is the only action that works after sending.
    if (action.type === 'restart') return { ...initialState(state.tiles.map((tile) => tile.letter)), hints: state.hints };
    
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

        case 'hint': {
            const isOnBoard = action.position >= 0 && action.position < state.tiles.length;
            const isTaken = state.hints.some((hint) => hint.position === action.position);
            const tile = state.tiles.find((t) => t.letter === action.letter && !isHint(state, t.id));
            if (!isOnBoard || isTaken || tile === undefined || state.hints.length >= MAX_HINTS_LETRAS) return state;
            // A new hint also puts back the hints that were taken off.
            return {
                ...state,
                picked: [],
                hints: [...state.hints, {position: action.position, tileId: tile.id}],
                hintsShown: true,
            };
        }

        case 'toggleHints': {
            if (state.hints.length === 0) return state;
            // Taking the hints off keeps the player's letters, and their tiles are free again.
            if (state.hintsShown) return { ...state, hintsShown: false };
            // Putting them back erases the player's letters, like a new hint.
            return { ...state, picked: [], hintsShown: true };
        }

        case 'submit': {
            const word = getWord(state);
            const letters = state.tiles.map((tile) => tile.letter);
            if (!canSubmit(word, letters) || !usesAllHints(state)) {
                return state;
            }
            const isValid = isInDictionary(word, action.dictionary);
            const hintsUsed = state.hints.length;
            return {
                ...state,
                result: {
                    word,
                    isValid,
                    score: scoreWithHints(calculateScore(word, isValid), hintsUsed),
                    hintPenalty: hintPenalty(hintsUsed),
                },
            };
        }
        
        default: {
            const unexpected: never = action;
            throw new Error(`Unknown action: ${JSON.stringify(unexpected)}`);
        }
    }
}