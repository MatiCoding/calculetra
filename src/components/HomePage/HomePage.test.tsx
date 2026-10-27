// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage';

// A fake /cifras page, so the tests can see if the card navigates there.
function renderHome() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cifras" element={<p>Página de Cifras</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

// Replaces read-only layout properties (clientWidth, offsetLeft...) of one element.
function fakeSize(element: HTMLElement, sizes: Record<string, number>) {
  for (const [name, value] of Object.entries(sizes)) {
    Object.defineProperty(element, name, { value, configurable: true });
  }
}

describe('HomePage', () => {
  beforeEach(() => {
    // Only Date is faked, so the challenge number is always the same.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-27T10:00:00Z'));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows the number of today's challenge", () => {
    renderHome();

    expect(screen.getByText(/Reto nº 9/)).toBeTruthy();
  });

  it('shows the Cifras card with its name, description and button text', () => {
    renderHome();

    const card = screen.getByRole('button', { name: /Cifras/ });
    expect(card.textContent).toContain('Seis números');
    expect(card.textContent).toContain('Jugar el reto');
  });

  it('shows the Letras card as coming soon', () => {
    renderHome();

    const card = screen.getByRole('button', { name: /Letras/ });
    expect(card.textContent).toContain('Próximamente');
    expect(card.getAttribute('aria-disabled')).toBe('true');
  });

  it('opens /cifras when the Cifras card is clicked', () => {
    renderHome();

    fireEvent.click(screen.getByRole('button', { name: /Cifras/ }));

    expect(screen.getByText('Página de Cifras')).toBeTruthy();
  });

  it('does not navigate when the Letras card is clicked', () => {
    renderHome();

    fireEvent.click(screen.getByRole('button', { name: /Letras/ }));

    expect(screen.queryByText('Página de Cifras')).toBeNull();
    expect(screen.getByRole('button', { name: /Letras/ })).toBeTruthy();
  });

  it('starts with the Cifras card as the active one', () => {
    renderHome();

    expect(screen.getByRole('button', { name: /Cifras/ }).dataset.active).toBe('true');
    expect(screen.getByRole('button', { name: /Letras/ }).dataset.active).toBe('false');
  });

  it('makes the card in the centre the active one when the track scrolls', () => {
    renderHome();
    const cifras = screen.getByRole('button', { name: /Cifras/ });
    const letras = screen.getByRole('button', { name: /Letras/ });
    const track = cifras.parentElement!;

    // jsdom does not lay out the page, so every size is 0. We give the track
    // and the cards the sizes they would have in a browser, with the track
    // scrolled until Letras is in the centre.
    fakeSize(track, { clientWidth: 400, scrollLeft: 358 });
    fakeSize(cifras, { offsetLeft: 30, offsetWidth: 340 });
    fakeSize(letras, { offsetLeft: 388, offsetWidth: 340 });
    fireEvent.scroll(track);

    expect(letras.dataset.active).toBe('true');
    expect(cifras.dataset.active).toBe('false');
  });

  it('hides the decorative tiles from screen readers', () => {
    renderHome();

    const card = screen.getByRole('button', { name: /Cifras/ });
    expect(card.querySelector('[aria-hidden="true"]')?.textContent).toContain('75');
  });
});
