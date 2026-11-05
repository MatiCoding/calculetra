import { applyOperation } from "./operation";
import type {GameState, OperationResult} from './typesCifras';

// What the selected tile and operator would give with another tile, without changin the state. 
export function previewOperation(state: GameState, tileId: number) : OperationResult | null {
    const {selectedId, operator} = state;
    if(state.finished || selectedId === null || operator === null || tileId === selectedId) {
        return null;
    }

    const left = state.tiles.find((tile) => tile.id === selectedId);
    const right = state.tiles.find((tile) => tile.id === tileId);
    if (left === undefined || right === undefined) {
        return null;
    }

    return applyOperation(left.value, operator, right.value);
}