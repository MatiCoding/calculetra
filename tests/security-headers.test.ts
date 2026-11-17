import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Vitest runs from the project root, so this path points to our _headers file.
// Vite copies public/_headers to dist/, and Cloudflare reads it from there.
const lines = readFileSync('public/_headers', 'utf-8')
    .split('\n')
    .map((line) => line.trim());

function getHeader(key: string): string | undefined {
    // Every header goes under the "/*" rule, so it applies to all pages.
    const rules = lines.slice(lines.indexOf('/*') + 1);
    const line = rules.find((rule) => rule.startsWith(`${key}:`));
    return line?.slice(key.length + 1).trim();
}

describe('security headers', () => {
    const csp = getHeader('Content-Security-Policy') ?? '';

    it('applies the headers to every page', () => {
        expect(lines).toContain('/*');
    });

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

    it('only sends the origin to other sites', () => {
        expect(getHeader('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });
});
