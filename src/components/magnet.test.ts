import { describe, expect, it } from 'vitest';
import { MAGNET_GAP_MS, MAGNET_MS, magnetTime } from './magnet';

describe('magnetTime', () => {
    it('is the time of one circle when there is only one key', () => {
        expect(magnetTime(1)).toBe(MAGNET_MS);
    });

    it('adds one gap for each key after the first one', () => {
        expect(magnetTime(6)).toBe(MAGNET_MS + 5 * MAGNET_GAP_MS);
        expect(magnetTime(9)).toBe(MAGNET_MS + 8 * MAGNET_GAP_MS);
    });
});
