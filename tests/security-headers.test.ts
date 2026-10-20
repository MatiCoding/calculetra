import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Header = { key: string; value: string };
type VercelConfig = { headers?: { source: string; headers: Header[] }[] };

// Vitest runs from the project root, so this path points to our vercel.json.
const config: VercelConfig = JSON.parse(readFileSync('vercel.json', 'utf-8'));

function getHeader(key: string): string | undefined {
    const allPages = config.headers?.find((rule) => rule.source === '/(.*)');
    return allPages?.headers.find((header) => header.key === key)?.value;
}

describe('security headers', () => {
    const csp = getHeader('Content-Security-Policy') ?? '';

    it('sends a Content-Security-Policy', () => {
        expect(csp).not.toBe('');
    });

    it('only runs our own scripts', () => {
        expect(csp).toContain("script-src 'self'");
        expect(csp).not.toContain("'unsafe-inline'");
        expect(csp).not.toContain("'unsafe-eval'");
    });

    it('allows requests to Supabase', () => {
        expect(csp).toMatch(/connect-src [^;]*https:\/\/[a-z0-9]+\.supabase\.co/);
    });

    it('cannot be embedded in other sites', () => {
        expect(csp).toContain("frame-ancestors 'none'");
        expect(getHeader('X-Frame-Options')).toBe('DENY');
    });

    it('does not let the browser guess file types', () => {
        expect(getHeader('X-Content-Type-Options')).toBe('nosniff');
    });
});