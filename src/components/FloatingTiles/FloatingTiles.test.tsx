// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import FloatingTiles from './FloatingTiles';

describe('FloatingTiles', () => {
  afterEach(cleanup);

  it('is hidden from screen readers', () => {
    render(<FloatingTiles game="Cifras" />);

    expect(screen.getByTestId('floating-tiles').getAttribute('aria-hidden')).toBe('true');
  });

  it('has number tiles and letter tiles', () => {
    render(<FloatingTiles game="Cifras" />);

    const text = screen.getByTestId('floating-tiles').textContent;
    expect(text).toContain('75');
    expect(text).toContain('A');
  });

  it('lights up only the tiles of the chosen game', () => {
    render(<FloatingTiles game="Letras" />);

    const tiles = Array.from(screen.getByTestId('floating-tiles').children) as HTMLElement[];
    const lit = tiles.filter((tile) => tile.dataset.lit === 'true').map((tile) => tile.textContent);
    expect(lit).toContain('A');
    expect(lit).not.toContain('75');
  });
  
  it('neither lights up nor fades any tile when there is no game', () => {
    render(<FloatingTiles game={null} />);

    const tiles = Array.from(screen.getByTestId('floating-tiles').children) as HTMLElement[];
    expect(tiles.every((tile) => tile.dataset.lit === undefined)).toBe(true);
  });
});