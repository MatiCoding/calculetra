import { afterEach, describe, expect, it } from 'vitest';
import { build, type Rolldown } from 'vite';

// Builds the app like Vercel does and reads the generated JavaScript.
// Values in process.env win over .env files, so a local .env.local
// cannot change the result of these tests.
async function buildJs(flag: string): Promise<string> {
    process.env.VITE_UNDER_CONSTRUCTION = flag;

    const result = await build({
        mode: 'production',
        logLevel: 'silent',
        build: { write: false },
    });
    const outputs = (Array.isArray(result) ? result : [result]) as Rolldown.RolldownOutput[];

    return outputs
        .flatMap((output) => output.output)
        .filter((file) => file.type === 'chunk')
        .map((chunk) => chunk.code)
        .join('\n');
}

describe('production build', () => {
    afterEach(() => {
        delete process.env.VITE_UNDER_CONSTRUCTION;
    });

    it('ships only the under construction page when the flag is on', async () => {
        const js = await buildJs('true');

        expect(js).toContain('Estamos preparando el reto diario');
        expect(js).not.toContain('Objetivo');
    }, 30_000);

    it('ships only the game when the flag is off', async () => {
        const js = await buildJs('false');

        expect(js).toContain('Objetivo');
        expect(js).not.toContain('Estamos preparando el reto diario');
    }, 30_000);
});
