// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fakeMatchMedia } from '../../test/fakeMatchMedia';
import HomePage from './HomePage';

// Shows the navigation state, so the tests can see when it is forgotten.
function StateProbe() {
    const location = useLocation();
    return <p data-testid="state">{JSON.stringify(location.state)}</p>;
}

// Opens the home page as if we came back from `from` (or opened it directly, without state).
function renderHomeFrom(from?: string) {
    const state = from === undefined ? null : { from };
    render(
        <MemoryRouter initialEntries={[{ pathname: '/', state }]}>
            <Routes>
                <Route path="/" element={<><HomePage /><StateProbe /></>} />
            </Routes>
        </MemoryRouter>,
    );
}

// The cards are found by their text, because "Ir a Letras" (the dots) also has the name of the game.
function letrasCard() {
    return screen.getByRole('button', { name: /Nueve letras/ });
}

function cifrasCard() {
    return screen.getByRole('button', { name: /Seis números/ });
}

describe('HomePage arrival from a game', () => {
    beforeEach(() => {
        fakeMatchMedia(false);
    });

    afterEach(cleanup);

    it('puts Cifras in the middle when the page is opened directly', () => {
        renderHomeFrom();

        expect(cifrasCard().dataset.active).toBe('true');
        expect(letrasCard().dataset.active).toBe('false');
    });

    it('puts Letras in the middle when we come back from Letras', () => {
        renderHomeFrom('Letras');

        expect(letrasCard().dataset.active).toBe('true');
        expect(cifrasCard().dataset.active).toBe('false');
    });

    it('puts Cifras in the middle when we come back from Cifras', () => {
        renderHomeFrom('Cifras');

        expect(cifrasCard().dataset.active).toBe('true');
    });

    it('puts Cifras in the middle when we come back from a game that is not on the home page', () => {
        renderHomeFrom('Panel');

        expect(cifrasCard().dataset.active).toBe('true');
    });

    it('forgets the navigation state, so reloading does not play the arrival again', () => {
        renderHomeFrom('Letras');

        expect(screen.getByTestId('state').textContent).toBe('null');
        // The page still remembers where we came from.
        expect(letrasCard().dataset.active).toBe('true');
    });
});
