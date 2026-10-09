import { afterEach, describe, expect, it, vi } from 'vitest';

// IS_UNDER_CONSTRUCTION is computed once, when the module is first imported.
// To test different values we stub the variable, clear the module cache and
// import the module again.
async function loadFlag(value: string | undefined): Promise<boolean> {
    vi.stubEnv('VITE_UNDER_CONSTRUCTION', value);
    vi.resetModules();
    const { IS_UNDER_CONSTRUCTION } = await import('./flags');
    return IS_UNDER_CONSTRUCTION;
}

describe('IS_UNDER_CONSTRUCTION', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('is true when the variable is "true"', async () => {
        expect(await loadFlag('true')).toBe(true);
    });

    it('is false when the variable is not set', async () => {
        expect(await loadFlag(undefined)).toBe(false);
    });

    it('is false when the variable is "false"', async () => {
        expect(await loadFlag('false')).toBe(false);
    });

    it('is false when the variable is empty', async () => {
        expect(await loadFlag('')).toBe(false);
    });

    it.each(['TRUE', 'True', ' true', '1', 'yes'])(
        'is false for "%s" (only the exact value "true" turns it on)',
        async (value) => {
            expect(await loadFlag(value)).toBe(false);
        },
    );
});
