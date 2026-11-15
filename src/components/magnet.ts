// The circles of the game colour that join the home page and a game ("magnets").
// On the way in they shrink onto each key or tile; on the way out they grow out of them.

// Each circle starts a bit later than the one before.
export const MAGNET_GAP_MS = 40;
// How long a circle takes to shrink into its key, or to grow out of it.
export const MAGNET_MS = 750;

// How long the circles of `count` keys take, until the last one has finished.
export function magnetTime(count: number): number {
    return MAGNET_MS + (count - 1) * MAGNET_GAP_MS;
}