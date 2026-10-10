// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

// MemoryRouter keeps the URL in memory, so each test chooses the page it
// starts on. The last entry in initialEntries is the current page.
function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routes', () => {
  afterEach(cleanup);

  it('shows the game on /', () => {
    renderAt('/');

    expect(screen.getByText(/Objetivo/)).toBeTruthy();
  });

  it('shows the sign up page on /signup', () => {
    renderAt('/signup');

    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeTruthy();
    expect(screen.queryByText(/Objetivo/)).toBeNull();
  });

  it('goes to the sign up page from the header link', () => {
    renderAt('/');

    fireEvent.click(screen.getByRole('link', { name: 'Crear cuenta' }));

    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeTruthy();
  });

  it('goes back to the game from the title link', () => {
    renderAt('/signup');

    fireEvent.click(screen.getByRole('link', { name: 'Calculetra' }));

    expect(screen.getByText(/Objetivo/)).toBeTruthy();
  });
});
