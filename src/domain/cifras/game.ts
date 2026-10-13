import type { Challenge, GameAction, GameState } from "./types";

export function initialState(challenge: Challenge) : GameState{
    return {
        challenge,
        tiles: challenge.numbers.map((value, index) => ({ id: index, value })),
        steps: [],
        selectedId: null,
        operator: null,
        error: null,
        finished: false
    }
}

export function gameReducer(state : GameState, action : GameAction) : GameState {
    if (state.finished && action.type !== 'reset') {
        return state;
    }

    switch (action.type) {
        case 'selectTile':
            return { ...state, selectedId: action.id };
        case 'selectOperator':
            return { ...state, operator: action.operator };
        case 'reset':
            return initialState(state.challenge);
        case 'finish':
            return { ...state, finished: true, selectedId: null, operator: null, error: null };
        case 'undo':
            if (state.steps.length === 0) return state;
            const lastStep = state.steps[state.steps.length - 1];
        default: {
            const unexpected: never = action;
            throw new Error(`Unknown action: ${JSON.stringify(unexpected)}`);
        }
    }
}