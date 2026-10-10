import { afterEach, describe, expect, it, vi } from 'vitest';

const VALID_URL = 'https://test.supabase.co';
const VALID_KEY = 'test-publishable-key';

// The client is created once, when the module is first imported.
// To test different values we stub the variables, clear the module cache and
// import the module again.
async function loadClient(url: string | undefined, key: string | undefined) {
    vi.stubEnv('VITE_SUPABASE_URL', url);
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', key);
    vi.resetModules();
    return import('./supabaseClient');
}

describe('supabaseClient', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('creates the client when both variables are set', async () => {
        const { supabase } = await loadClient(VALID_URL, VALID_KEY);
        expect(supabase).toBeDefined();
    });

    it.each([undefined, ''])('throws when VITE_SUPABASE_URL is %j', async (url) => {
        await expect(loadClient(url, VALID_KEY)).rejects.toThrow('VITE_SUPABASE_URL');
    });

    it.each([undefined, ''])(
        'throws when VITE_SUPABASE_PUBLISHABLE_KEY is %j',
        async (key) => {
            await expect(loadClient(VALID_URL, key)).rejects.toThrow(
                'VITE_SUPABASE_PUBLISHABLE_KEY',
            );
        },
    );
});
