export type Challenge = { numbers: Array<number>, target : number};

export type OperationError = 'not-positive' | 'not-exact';

export type Operator = '+' | '-' | '×' | '÷';
export type OperationResult = { ok: true, value: number } | { ok: false, reason: OperationError };

export type SubstituteError = {value: number, reason: OperationError};
export type Tile = {id: number, value: number};
export type HintStep = {left: number, operator: Operator, right: number};  // the values to combine, like a SolverStep
export type Step = {left: Tile, operator: Operator, right: Tile, result: Tile, byHint: boolean};  // byHint: a hint did it, not the player
export type GameState = {
    challenge: Challenge, 
    tiles: Array<Tile>,
    steps: Array<Step>,
    selectedId: number | null,
    operator: Operator | null,
    error: OperationError | null,
    substituteError: SubstituteError | null,
    changedIds: Array<number>,   // The tiles that changed in the last swap: the new number and the results with a new value.
    hintsUsed: number,           // Paid hints. Undoing or resetting does not give them back.
    finished: boolean
}
export type GameAction =
    | { type: 'selectTile', id: number }
    | { type: 'selectOperator', operator: Operator }
    | { type: 'undo' }
    | { type: 'undoTo', resultId: number}
    | {type: 'substitute', oldTileId: number, newTileId: number}
    | { type: 'hint', step: HintStep }
    | { type: 'undoPlayerSteps' }
    | { type: 'reset' }
    | { type: 'finish' }

export type TreeNode = 
    | {kind: 'leaf', tile: Tile}
    | {kind: 'step', tile: Tile, operator: Operator, left: TreeNode, right: TreeNode};