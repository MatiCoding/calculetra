// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { fakeMatchMedia } from '../test/fakeMatchMedia';
import { useMediaQuery } from './useMediaQuery';

// A matchMedia whose answer can change during the test, and that keeps the
// listener the hook adds, so the test can call it like the browser would.
function changingMatchMedia() {
  const media = { matches: false, listener: undefined as (() => void) | undefined, removed: false };
  window.matchMedia = vi.fn((query: string) => ({
    get matches() {
      return media.matches;
    },
    media: query,
    addEventListener: (_type: string, listener: () => void) => {
      media.listener = listener;
    },
    removeEventListener: () => {
      media.removed = true;
    },
  })) as unknown as typeof window.matchMedia;
  return media;
}

describe('useMediaQuery', () => {
  it('returns true when the query matches', () => {
    fakeMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(max-width: 600px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when the query does not match', () => {
    fakeMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 600px)'));
    expect(result.current).toBe(false);
  });

  it('asks the browser about the query it is given', () => {
    fakeMatchMedia(false);
    renderHook(() => useMediaQuery('(max-width: 600px)'));
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 600px)');
  });

  it('can answer different queries differently', () => {
    fakeMatchMedia((query) => query.includes('max-width'));
    const { result } = renderHook(() => [
      useMediaQuery('(max-width: 600px)'),
      useMediaQuery('(prefers-reduced-motion: reduce)'),
    ]);
    expect(result.current).toEqual([true, false]);
  });

  it('updates when the query starts to match', () => {
    const media = changingMatchMedia();
    const { result } = renderHook(() => useMediaQuery('(max-width: 600px)'));
    expect(result.current).toBe(false);

    media.matches = true;
    act(() => media.listener?.());

    expect(result.current).toBe(true);
  });

  it('stops listening when the component is removed', () => {
    const media = changingMatchMedia();
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 600px)'));
    unmount();
    expect(media.removed).toBe(true);
  });
});