import { vi } from 'vitest';

// jsdom has no matchMedia, so tests that read a media query call this first.
// Every query answers `matches`, so fakeMatchMedia(true) is like a browser
// with "reduce motion" turned on.
export function fakeMatchMedia(matches: boolean | ((query: string) => boolean)) {
    window.matchMedia = vi.fn((query: string) => ({
        matches: typeof matches === 'function' ? matches(query) : matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}
