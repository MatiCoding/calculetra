export type Tile = { id: number, letter:string};
export type Result = {word: string, isValid: boolean, score: number};
export type Hint = {position: number, tileId: number};  // a tile locked in a slot of the board.

export type GameState = {
    tiles: Array<Tile>,
    picked: Array<number>,  // ids of the picked tiles
    hints: Array<Hint>,
    result: Result | null   // null until the word is sent
};

export type GameAction = 
    | { type: 'pick', id: number }
    | {type: 'removeLast'}
    | { type: 'clear' }
    | { type: 'type', letter: string }
    | {type: 'hint', position: number, letter: string}
    | { type: 'submit', dictionary: ReadonlySet<string> }
    | {type: 'restart'};