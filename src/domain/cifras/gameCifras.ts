import { applyOperation } from './operation';
import type { Challenge, GameAction, GameState, Tile } from './typesCifras';

export function initialState(challenge: Challenge): GameState {
    return {
        challenge,
        tiles: challenge.numbers.map((value, index) => ({ id: index, value })),
        steps: [],
        selectedId: null,
        operator: null,
        error: null,
        finished: false,
    };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
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
        case 'reset':
            return initialState(state.challenge);
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
        steps: [...state.steps, { left, operator, right, result: resultTile }],
        selectedId: null,
        operator: null,
        error: null,
        finished: result.value === state.challenge.target,
    };
}