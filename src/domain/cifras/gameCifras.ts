import { applyOperation } from './operation';
import type { Challenge, GameAction, GameState, Tile, HintStep, Operator } from './typesCifras';
import { substitute } from './substituteCifras';

export function initialState(challenge: Challenge): GameState {
    return {
        challenge,
        tiles: challenge.numbers.map((value, index) => ({ id: index, value })),
        steps: [],
        selectedId: null,
        operator: null,
        error: null,
        substituteError: null,
        finished: false,
        changedIds: [],
        hintsUsed: 0,
        hints: [],
    };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
    const next = reduce(state, action);
    // The message of a failed swap only lasts until the player does something else.
    if (action.type === 'substitute' || (next.substituteError === null && next.changedIds.length === 0)){
        return next;
    }
    return {...next, substituteError: null, changedIds: []};
}

export function reduce(state: GameState, action: GameAction): GameState {
    if (state.finished && action.type !== 'reset') {
        return state;
    }

    switch (action.type) {
        case 'selectTile': {
            if (action.id === state.selectedId) {
                return { ...state, selectedId: null, operator: null };
            }
            if (state.selectedId === null || state.operator === null) {
                return { ...state, selectedId: action.id, error: null };
            }
            return combine(state, action.id);
        }
        case 'selectOperator': {
            if (state.selectedId === null) {
                return state;
            }
            return { ...state, operator: action.operator, error: null };
        }
        case 'undo': {
            if (state.steps.length === 0) {
                return state;
            }
            const lastStep = state.steps[state.steps.length - 1];
            const tiles = [
                ...state.tiles.filter((tile) => tile.id !== lastStep.result.id),
                lastStep.left,
                lastStep.right,
            ].toSorted((a, b) => a.id - b.id);

            return {
                ...state,
                tiles,
                steps: state.steps.slice(0, -1),
                selectedId: null,
                operator: null,
                error: null,
            };
        }
        case 'undoTo': {
            const index = state.steps.findIndex((step) => step.result.id === action.resultId);
            if (index === -1) {
                return state;
            }

            // The result and every later result that was made from it, directly or not.
            const removedIds = new Set([action.resultId]);
            for (const step of state.steps.slice(index + 1)) {
                if (removedIds.has(step.left.id) || removedIds.has(step.right.id)) {
                    removedIds.add(step.result.id);
                }
            }

            const removedSteps = state.steps.filter((step) => removedIds.has(step.result.id));
            const freedTiles = removedSteps
                .flatMap((step) => [step.left, step.right])
                .filter((tile) => !removedIds.has(tile.id));
            const tiles = [
                ...state.tiles.filter((tile) => !removedIds.has(tile.id)),
                ...freedTiles,
            ].toSorted((a, b) => a.id - b.id);

            return {
                ...state,
                tiles,
                steps: state.steps.filter((step) => !removedIds.has(step.result.id)),
                selectedId: null,
                operator: null,
                error: null,
            };
        }
        case 'substitute':
            return substitute(state, action.oldTileId, action.newTileId);        
        case 'hint':
            return applyHint(state, action.step);
        case 'undoPlayerSteps':
            return undoSteps(state, false);
        case 'removeHints':
            return undoSteps(state, true);
        case 'showHints': {
            // The board from the start, with the paid hints done again. The player's steps go.
            let next: GameState = { ...initialState(state.challenge), hintsUsed: state.hintsUsed, hints: state.hints };
            for (const hint of state.hints) {
                next = doHint(next, hint);
            }
            return next;
        }
        case 'reset':
            return { ...initialState(state.challenge), hintsUsed: state.hintsUsed, hints: state.hints };
        case 'finish':
            return { ...state, finished: true, selectedId: null, operator: null, error: null };
        default: {
            const unexpected: never = action;
            throw new Error(`Unknown action: ${JSON.stringify(unexpected)}`);
        }
    }
}

// Combines the selected tile with the second one using the selected operator.
function combine(state: GameState, secondId: number): GameState {
    const { selectedId, operator } = state;
    const left = state.tiles.find((tile) => tile.id === selectedId);
    const right = state.tiles.find((tile) => tile.id === secondId);
    if (operator === null || left === undefined || right === undefined) {
        return state;
    }

    return addStep(state, left, operator, right, false);
}

// Does the hint's operation with two tiles of the board that have those values.
function doHint(state: GameState, hint: HintStep): GameState {
    const left = state.tiles.find((tile) => tile.value === hint.left);
    const right = state.tiles.find((tile) => tile.value === hint.right && tile !== left);
    if (left === undefined || right === undefined) {
        return state;
    }
    return addStep(state, left, hint.operator, right, true);
}

// A new hint. It is only paid and kept when its operation was really done.
function applyHint(state: GameState, hint: HintStep): GameState {
    const next = doHint(state, hint);
    if (next.steps.length === state.steps.length) return next;
    return { ...next, hintsUsed: state.hintsUsed + 1, hints: [...state.hints, hint] };
}

// Undoes the hints' steps (byHint true) or the player's (byHint false) one by one.
// undoTo also takes away what was built on them.
function undoSteps(state: GameState, byHint: boolean): GameState {
    let next = state;
    let step = next.steps.find((step) => step.byHint === byHint);
    while (step !== undefined) {
        next = reduce(next, { type: 'undoTo', resultId: step.result.id });
        step = next.steps.find((step) => step.byHint === byHint);
    }
    return next;
}

// Puts the result of left operator right on the board, as a new step.
function addStep(state: GameState, left: Tile, operator: Operator, right: Tile, byHint: boolean): GameState {        

    const result = applyOperation(left.value, operator, right.value);
    if (!result.ok) {
        return { ...state, error: result.reason, selectedId: null, operator: null };
    }

    // A new id, higher than any tile on the board, so sorting by id keeps the original order.
    const resultTile: Tile = {
        id: Math.max(...state.tiles.map((tile) => tile.id)) + 1,
        value: result.value,
    };

    return {
        ...state,
        tiles: [...state.tiles.filter((tile) => tile !== left && tile !== right), resultTile],
        steps: [...state.steps, { left, operator, right, result: resultTile, byHint }],
        selectedId: null,
        operator: null,
        error: null,
        finished: result.value === state.challenge.target,
    };
}