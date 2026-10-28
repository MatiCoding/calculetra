// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeMatchMedia } from '../../test/fakeMatchMedia';
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

// Gives the track and its cards the sizes they would have in a browser
// (340 px wide and 18 px apart), scrolls until the card whose name matches
// `name` is in the centre, and fires the scroll event. It looks at the order
// of the cards in the page, so it works whatever that order is.
function scrollToCard(name: RegExp) {
  const target = screen.getByRole('button', { name });
  const track = target.parentElement!;
  const cards = Array.from(track.children) as HTMLElement[];
  cards.forEach((card, i) => fakeSize(card, { offsetLeft: 30 + i * 358, offsetWidth: 340 }));
  fakeSize(track, { clientWidth: 400, scrollLeft: cards.indexOf(target) * 358 });
  fireEvent.scroll(track);
}

function scrollToLetras() {
  scrollToCard(/Próximamente/);
}

function scrollToMore() {
  scrollToCard(/Estadísticas/);
}

describe('HomePage', () => {
  beforeEach(() => {
    // jsdom does not have scrollIntoView, so we put a fake one that only
    // remembers how it was called.
    Element.prototype.scrollIntoView = vi.fn();
    // By default, a browser without "reduce motion".
    fakeMatchMedia(false);
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

  it('grows the Cifras card and opens /cifras when the animation ends', () => {
    // Now the timers are fake too, so the test decides when time passes.
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    renderHome();

    fireEvent.click(screen.getByRole('button', { name: /Jugar el reto/ }));

    // While it grows, we are still on the home page.
    expect(screen.getByTestId('grow')).toBeTruthy();
    act(() => vi.advanceTimersByTime(499));
    expect(screen.queryByText('Página de Cifras')).toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText('Página de Cifras')).toBeTruthy();
  });

  it('opens /cifras at once, without growing, with reduced motion', () => {
    fakeMatchMedia(true);
    renderHome();

    fireEvent.click(screen.getByRole('button', { name: /Jugar el reto/ }));

    expect(screen.getByText('Página de Cifras')).toBeTruthy();
  });

  it('scrolls smoothly to a card, but not with reduced motion', () => {
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: 'Ir a Letras' }));
    expect(Element.prototype.scrollIntoView).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'smooth' }));

    fakeMatchMedia(true);
    fireEvent.click(screen.getByRole('button', { name: 'Ir a Letras' }));
    expect(Element.prototype.scrollIntoView).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'auto' }));
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

    // jsdom does not lay out the page, so every size is 0. We give the track
    // and the cards the sizes they would have in a browser, with the track
    // scrolled until Letras is in the centre.
    scrollToLetras();

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

  it('moves to the cards on each side of Cifras with the arrows', () => {
    renderHome();
    const scroll = vi.mocked(Element.prototype.scrollIntoView);

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));

    // scrollIntoView is on the prototype, so "this" says which card it moved.
    expect(scroll.mock.contexts[0]).toBe(screen.getByRole('button', { name: /Estadísticas/ }));
    expect(scroll.mock.contexts[1]).toBe(screen.getByRole('button', { name: /Próximamente/ }));
  });

  it('disables the previous arrow on the first card and the next arrow on the last one', () => {
    renderHome();
    const previous = screen.getByRole('button', { name: 'Anterior' }) as HTMLButtonElement;
    const next = screen.getByRole('button', { name: 'Siguiente' }) as HTMLButtonElement;

    // Cifras is in the middle, so both arrows work.
    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(false);

    scrollToLetras();
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    scrollToMore();
    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Ir a Más retos' }).getAttribute('aria-current')).toBe('true');
  });

  it('shows a third card, "Más retos", that cannot be played yet', () => {
    renderHome();

    // The dot "Ir a Más retos" also has "Más retos" in its name, so the card
    // is found by its description.
    const card = screen.getByRole('button', { name: /Estadísticas/ });
    expect(card.textContent).toContain('Más retos');
    expect(card.getAttribute('aria-disabled')).toBe('true');
  });

  it('moves "Más retos" to the centre when it is clicked, and then does nothing', () => {
    renderHome();
    const more = screen.getByRole('button', { name: /Estadísticas/ });

    fireEvent.click(more);
    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts).toContain(more);

    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    scrollToMore();
    fireEvent.click(more);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(screen.queryByText('Página de Cifras')).toBeNull();
  });

  it('moves a card that is not in the centre to the centre before opening it', () => {
    renderHome();
    scrollToLetras();
    const cifras = screen.getByRole('button', { name: /Jugar el reto/ });

    fireEvent.click(cifras);

    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts).toContain(cifras);
    expect(screen.queryByText('Página de Cifras')).toBeNull();
  });

  it('moves the Letras card to the centre when it is clicked from the side', () => {
    renderHome();
    const letras = screen.getByRole('button', { name: /Próximamente/ });

    fireEvent.click(letras);

    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts).toContain(letras);
  });

  it('does nothing when the Letras card in the centre is clicked', () => {
    renderHome();
    scrollToLetras();

    fireEvent.click(screen.getByRole('button', { name: /Próximamente/ }));

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(screen.queryByText('Página de Cifras')).toBeNull();
  });

  it('does not light up any tiles when no card is pointed, even if one is in the centre', () => {
    renderHome();
    scrollToLetras();

    expect(screen.getByTestId('floating-tiles').dataset.game).toBeUndefined();
  });

  it('lights up the tiles of the card under the pointer, and goes back when it leaves', () => {
    renderHome();
    const letras = screen.getByRole('button', { name: /Próximamente/ });

    fireEvent.pointerEnter(letras);
    expect(screen.getByTestId('floating-tiles').dataset.game).toBe('Letras');

    fireEvent.pointerLeave(letras);
    expect(screen.getByTestId('floating-tiles').dataset.game).toBeUndefined();
  });

  it('lights up the tiles of the card with the focus', () => {
    renderHome();

    fireEvent.focus(screen.getByRole('button', { name: /Próximamente/ }));

    expect(screen.getByTestId('floating-tiles').dataset.game).toBe('Letras');
  });

  it('hides the decorative tiles from screen readers', () => {
    renderHome();

    const card = screen.getByRole('button', { name: /Jugar el reto/ });
    expect(card.querySelector('[aria-hidden="true"]')?.textContent).toContain('75');
  });
});
