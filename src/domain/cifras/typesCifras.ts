export type Challenge = { numbers: Array<number>, target : number};

export type OperationError = 'not-positive' | 'not-exact';

export type Operator = '+' | '-' | '×' | '÷';
export type OperationResult = { ok: true, value: number } | { ok: false, reason: OperationError };

export type SubstituteError = {value: number, reason: OperationError};
export type Tile = {id: number, value: number};
export type Step = {left: Tile, operator: Operator, right: Tile, result: Tile};
export type GameState = {
    challenge: Challenge, 
    tiles: Array<Tile>,
    steps: Array<Step>,
    selectedId: number | null,
    operator: Operator | null,
    error: OperationError | null,
    substituteError: SubstituteError | null,
    changedIds: Array<number>,   // The tiles that changed in the last swap: the new number and the results with a new value.
    finished: boolean
}
export type GameAction =
    | { type: 'selectTile', id: number }
    | { type: 'selectOperator', operator: Operator }
    | { type: 'undo' }
    | { type: 'undoTo', resultId: number}
    | {type: 'substitute', oldTileId: number, newTileId: number}
    | { type: 'reset' }
    | { type: 'finish' }

export type TreeNode = 
    | {kind: 'leaf', tile: Tile}
    | {kind: 'step', tile: Tile, operator: Operator, left: TreeNode, right: TreeNode};