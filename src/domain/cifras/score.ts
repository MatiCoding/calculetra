import type { GameState } from './types';

function distance(value: number, target: number): number {
    return Math.abs(value - target);
}

export function getBestValue(state: GameState): number {
    const { target } = state.challenge;

    return state.tiles
        .map((tile) => tile.value)
        .reduce((best, value) => {
            const isCloser = distance(value, target) < distance(best, target);
            const isTieButSmaller =
                distance(value, target) === distance(best, target) && value < best;

            return isCloser || isTieButSmaller ? value : best;
        });
}

export function calculateScore(target: number, value: number): number {
    const gap = distance(value, target);

    if (gap === 0) return 10;
    if (gap <= 5) return 7;
    if (gap <= 10) return 5;
    return 0;
}