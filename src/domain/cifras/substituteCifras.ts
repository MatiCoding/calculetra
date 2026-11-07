import { applyOperation } from './operation';
import type { GameState, Step, Tile } from './typesCifras';

export function substitute(state: GameState, oldTileId: number, newTileId: number): GameState {
    const isStarting = (tile: Tile) => tile.id < state.challenge.numbers.length;
    const usedTiles = state.steps.flatMap((step) => [step.left, step.right]);

    const oldTile = usedTiles.find((tile) => tile.id === oldTileId && isStarting(tile));
    const newTile = state.tiles.find((tile) => tile.id === newTileId && isStarting(tile));
    if (oldTile === undefined || newTile === undefined) {
        return state;
    }

    // The new version of each tile that changes: the swapped number and every result after it.
    const changed = new Map<number, Tile>([[oldTile.id, newTile]]);
    const latest = (tile: Tile) => changed.get(tile.id) ?? tile;

    const steps: Array<Step> = [];
    for (const step of state.steps) {
        const left = latest(step.left);
        const right = latest(step.right);
        const result = applyOperation(left.value, step.operator, right.value);
        if (!result.ok) {
            return {
                ...state,
                selectedId: null,
                operator: null,
                error: null,
                substituteError: { value: newTile.value, reason: result.reason },
            };
        }
        const resultTile = { id: step.result.id, value: result.value };
        changed.set(resultTile.id, resultTile);
        steps.push({ left, operator: step.operator, right, result: resultTile });
    }

    // The old number goes back to the board, where the new one was.
    const tiles = state.tiles
        .map((tile) => (tile.id === newTile.id ? oldTile : latest(tile)))
        .toSorted((a, b) => a.id - b.id);

    return {
        ...state,
        tiles,
        steps,
        selectedId: null,
        operator: null,
        error: null,
        substituteError: null,
        finished: steps.some((step) => step.result.value === state.challenge.target),
    };
}