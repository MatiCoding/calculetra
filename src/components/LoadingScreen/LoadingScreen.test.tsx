// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoadingScreen from './LoadingScreen';

describe('LoadingScreen', () => {
    // Fake timers: the test decides when time passes, so we don't wait 300 ms for real.
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('shows nothing during the first 300 ms', () => {
        render(<LoadingScreen />);

        act(() => {
            vi.advanceTimersByTime(299);
        });

        expect(screen.queryByRole('status')).toBeNull();
    });

    it('shows the status with "Cargando…" after 300 ms', () => {
        render(<LoadingScreen />);

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(screen.getByRole('status').textContent).toContain('Cargando…');
    });

    it('cancels the timer when it goes away before the delay', () => {
        const { unmount } = render(<LoadingScreen />);

        unmount();

        expect(vi.getTimerCount()).toBe(0);
    });
});