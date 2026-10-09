// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

async function renderRoot(flag: string | undefined) {
  vi.stubEnv('VITE_UNDER_CONSTRUCTION', flag);
  vi.resetModules();
  const { default: Root } = await import('./Root');
  render(<Root />);
}

describe('Root', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it('shows only the under construction page when the flag is on', async () => {
    await renderRoot('true');

    expect(screen.getByText('🚧 En construcción')).toBeTruthy();
    expect(screen.queryByText(/Objetivo/)).toBeNull();
    expect(screen.queryByRole('contentinfo')).toBeNull();
  });

  it('shows the game when the flag is not set', async () => {
    await renderRoot(undefined);

    expect(screen.getByText(/Objetivo/)).toBeTruthy();
    expect(screen.queryByText('🚧 En construcción')).toBeNull();
  });

  it('shows the game when the flag is "false"', async () => {
    await renderRoot('false');

    expect(screen.getByText(/Objetivo/)).toBeTruthy();
    expect(screen.queryByText('🚧 En construcción')).toBeNull();
  });
});
