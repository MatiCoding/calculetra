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
    // jsdom does not have scrollIntoView, so we put a fake one that only
    // remembers how it was called.
    Element.prototype.scrollIntoView = vi.fn();
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

    const card = screen.getByRole('button', { name: /Jugar el reto/ });
    expect(card.textContent).toContain('Seis números');
    expect(card.textContent).toContain('Jugar el reto');
  });

  it('shows the Letras card as coming soon', () => {
    renderHome();

    const card = screen.getByRole('button', { name: /Próximamente/ });
    expect(card.textContent).toContain('Próximamente');
    expect(card.getAttribute('aria-disabled')).toBe('true');
  });

  it('opens /cifras when the Cifras card is clicked', () => {
    renderHome();

    fireEvent.click(screen.getByRole('button', { name: /Jugar el reto/ }));

    expect(screen.getByText('Página de Cifras')).toBeTruthy();
  });

  it('does not navigate when the Letras card is clicked', () => {
    renderHome();

    fireEvent.click(screen.getByRole('button', { name: /Próximamente/ }));

    expect(screen.queryByText('Página de Cifras')).toBeNull();
    expect(screen.getByRole('button', { name: /Próximamente/ })).toBeTruthy();
  });

  it('starts with the Cifras card as the active one', () => {
    renderHome();

    expect(screen.getByRole('button', { name: /Jugar el reto/ }).dataset.active).toBe('true');
    expect(screen.getByRole('button', { name: /Próximamente/ }).dataset.active).toBe('false');
  });

  it('makes the card in the centre the active one when the track scrolls', () => {
    renderHome();
    const cifras = screen.getByRole('button', { name: /Jugar el reto/ });
    const letras = screen.getByRole('button', { name: /Próximamente/ });
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

  it('has a dot for each game, and the active one has aria-current', () => {
    renderHome();

    expect(screen.getByRole('button', { name: 'Ir a Cifras' }).getAttribute('aria-current')).toBe('true');
    expect(screen.getByRole('button', { name: 'Ir a Letras' }).getAttribute('aria-current')).toBe('false');
  });

  it('moves the card to the centre when its dot is clicked', () => {
    renderHome();
    const letras = screen.getByRole('button', { name: /Próximamente/ });

    fireEvent.click(screen.getByRole('button', { name: 'Ir a Letras' }));

    expect(letras.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ inline: 'center' }));
  });

  it('moves to the next card with the next arrow', () => {
    renderHome();
    const scroll = vi.mocked(Element.prototype.scrollIntoView);

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    // scrollIntoView is on the prototype, so "this" says which card it moved.
    expect(scroll.mock.contexts[0]).toBe(screen.getByRole('button', { name: /Próximamente/ }));
  });

  it('disables the previous arrow on the first card and the next arrow on the last one', () => {
    renderHome();
    const cifras = screen.getByRole('button', { name: /Jugar el reto/ });
    const letras = screen.getByRole('button', { name: /Próximamente/ });
    const previous = screen.getByRole('button', { name: 'Anterior' }) as HTMLButtonElement;
    const next = screen.getByRole('button', { name: 'Siguiente' }) as HTMLButtonElement;

    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    // Scroll until Letras is in the centre, like in the test above.
    fakeSize(cifras.parentElement!, { clientWidth: 400, scrollLeft: 358 });
    fakeSize(cifras, { offsetLeft: 30, offsetWidth: 340 });
    fakeSize(letras, { offsetLeft: 388, offsetWidth: 340 });
    fireEvent.scroll(cifras.parentElement!);

    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Ir a Letras' }).getAttribute('aria-current')).toBe('true');
  });

  it('hides the decorative tiles from screen readers', () => {
    renderHome();

    const card = screen.getByRole('button', { name: /Jugar el reto/ });
    expect(card.querySelector('[aria-hidden="true"]')?.textContent).toContain('75');
  });
});
