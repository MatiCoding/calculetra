export type Challenge = { numbers: Array<number>, target : number};

export type OperationError = 'not-positive' | 'not-exact';

export type Operator = '+' | '−' | '×' | '÷';
export type OperationResult = { ok: true, value: number } | { ok: false, reason: OperationError };

export type Tile = {id: number, value: number};
export type Step = {left: Tile, operator: Operator, right: Tile, result: Tile};
export type GameState = {
    challenge: Challenge, 
    tiles: Array<Tile>,
    steps: Array<Step>,
    selectedId: number | null,
    operator: Operator | null,
    error: OperationError | null,
    finished: boolean
}
export type GameAction =
    | { type: 'selectTile', id: number }
    | { type: 'selectOperator', operator: Operator }
    | { type: 'undo' }
    | { type: 'reset' }
    | { type: 'finish' }