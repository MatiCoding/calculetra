export type Tile = { id: number, letter:string};
export type Result = {word: string, isValid: boolean, score: number};

export type GameState = {
    tiles: Array<Tile>,
    picked: Array<number>,  // ids of the picked tiles
    result: Result | null   // null until the word is sent
};

export type GameAction = 
    | { type: 'pick', id: number }
    | {type: 'removeLast'}
    | { type: 'clear' }
    | { type: 'type', letter: string }
    | { type: 'submit', dictionary: ReadonlySet<string> };
