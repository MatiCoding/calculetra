// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeMatchMedia } from '../../test/fakeMatchMedia';
import BackToGames from './BackToGames';

// A fake home page that shows the game it says it comes from.
function FakeHome() {
    const location = useLocation();
    return <p>Portada, desde {location.state?.from ?? 'ninguno'}</p>;
}

function renderBack(onLeave = vi.fn()) {
    render(
        <MemoryRouter initialEntries={['/letras']}>
            <Routes>
                <Route path="/" element={<FakeHome />} />
                <Route path="/letras" element={<BackToGames game="Letras" onLeave={onLeave} />} />
            </Routes>
        </MemoryRouter>,
    );
    return onLeave;
}

function backLink() {
    return screen.getByRole('link', { name: 'Volver a los juegos' });
}

afterEach(cleanup);

describe('BackToGames', () => {
    beforeEach(() => {
        fakeMatchMedia(false);
    });

    it('is a real link to the home page', () => {
        renderBack();
        expect(backLink().getAttribute('href')).toBe('/');
    });

    it('starts the exit instead of going home at once', () => {
        const onLeave = renderBack();

        fireEvent.click(backLink());

        expect(onLeave).toHaveBeenCalledTimes(1);
        expect(screen.queryByText(/Portada/)).toBeNull();
    });

    it.each([
        ['Ctrl', { ctrlKey: true }],
        ['Cmd', { metaKey: true }],
        ['Shift', { shiftKey: true }],
    ])('does not start the exit with %s + click (new tab or window)', (_, keys) => {
        const onLeave = renderBack();

        fireEvent.click(backLink(), keys);

        expect(onLeave).not.toHaveBeenCalled();
    });

    it('does not start the exit with the middle button', () => {
        const onLeave = renderBack();

        fireEvent.click(backLink(), { button: 1 });

        expect(onLeave).not.toHaveBeenCalled();
    });

    it('goes home at once with reduced motion, and says which game it comes from', () => {
        fakeMatchMedia(true);
        const onLeave = renderBack();

        fireEvent.click(backLink());

        expect(onLeave).not.toHaveBeenCalled();
        screen.getByText('Portada, desde Letras');
    });

    it('is a plain link without a game (for example on the account page)', () => {
        render(
            <MemoryRouter initialEntries={['/account']}>
                <Routes>
                    <Route path="/" element={<FakeHome />} />
                    <Route path="/account" element={<BackToGames />} />
                </Routes>
            </MemoryRouter>,
        );

        fireEvent.click(backLink());

        screen.getByText('Portada, desde ninguno');
    });
});
