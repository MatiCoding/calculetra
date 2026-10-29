// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GameList from './GameList';

function renderList() {
  const onPlay = vi.fn();
  render(<GameList onPlay={onPlay} />);
  return onPlay;
}

// The button of each card's row, found by the game's name.
function row(name: RegExp) {
  return screen.getByRole('button', { name });
}

describe('GameList', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows a row for each game, in this order: Cifras, Letras and Más retos', () => {
    renderList();
    const names = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(names).toEqual([
      expect.stringContaining('Cifras'),
      expect.stringContaining('Letras'),
      expect.stringContaining('Más retos'),
    ]);
  });

  it('starts with only the Cifras card open', () => {
    renderList();
    expect(row(/Cifras/).getAttribute('aria-expanded')).toBe('true');
    expect(row(/Letras/).getAttribute('aria-expanded')).toBe('false');
    expect(row(/Más retos/).getAttribute('aria-expanded')).toBe('false');
  });

  it('links each row to the part it opens', () => {
    renderList();
    for (const name of [/Cifras/, /Letras/, /Más retos/]) {
      const id = row(name).getAttribute('aria-controls')!;
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it('opens a card when its row is clicked, and closes the one that was open', () => {
    renderList();
    fireEvent.click(row(/Letras/));
    expect(row(/Letras/).getAttribute('aria-expanded')).toBe('true');
    expect(row(/Cifras/).getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps the cards in the same order after opening another one', () => {
    renderList();
    fireEvent.click(row(/Más retos/));
    const names = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(names[0]).toContain('Cifras');
    expect(names[2]).toContain('Más retos');
  });

  it('keeps a card open when its row is clicked again', () => {
    renderList();
    fireEvent.click(row(/Cifras/));
    expect(row(/Cifras/).getAttribute('aria-expanded')).toBe('true');
  });

  it('makes the closed cards inert, so their content cannot get the focus', () => {
    renderList();
    const cifrasBody = document.getElementById(row(/Cifras/).getAttribute('aria-controls')!)!;
    const letrasBody = document.getElementById(row(/Letras/).getAttribute('aria-controls')!)!;
    expect(cifrasBody.hasAttribute('inert')).toBe(false);
    expect(letrasBody.hasAttribute('inert')).toBe(true);
  });

  it('calls onPlay with the Cifras card when "Jugar el reto" is clicked', () => {
    const onPlay = renderList();
    fireEvent.click(screen.getByRole('button', { name: /Jugar el reto/ }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay.mock.calls[0][0].textContent).toContain('Seis números');
  });

  it('shows "Próximamente" instead of a play button in Letras and Más retos', () => {
    renderList();
    fireEvent.click(row(/Letras/));
    expect(screen.getAllByText('Próximamente')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /Jugar el reto/ })).toHaveLength(1);
  });

  it('hides the small tiles from screen readers', () => {
    renderList();
    expect(screen.getByRole('button', { name: 'Cifras Hoy' })).toBe(row(/Cifras/));
  });
});