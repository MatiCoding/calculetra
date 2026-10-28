// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import NotFound from './NotFound';

// The first entry in a MemoryRouter gets the key "default", like the first
// page of a real visit. Passing ['/', '/broken'] simulates a user who came
// to the 404 page from inside the website.
function renderNotFound(entries: string[]) {
    render(
        <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
            <Routes>
                <Route path="/" element={<p>Página de inicio</p>} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('NotFound', () => {
    afterEach(cleanup);

    it('shows the path that was not found', () => {
        renderNotFound(['/reto-de-ayer']);

        expect(screen.getByText('/reto-de-ayer')).toBeTruthy();
    });

    it('links "Ir al reto de hoy" to the Cifras game', () => {
        renderNotFound(['/reto-de-ayer']);

        expect(screen.getByRole('link', { name: 'Ir al reto de hoy' }).getAttribute('href')).toBe('/cifras');
    });

    it('hides "Volver atrás" when the 404 is the first page of the visit', () => {
        renderNotFound(['/reto-de-ayer']);

        expect(screen.queryByRole('button', { name: 'Volver atrás' })).toBeNull();
    });

    it('goes back to the previous page with "Volver atrás"', () => {
        renderNotFound(['/', '/reto-de-ayer']);

        fireEvent.click(screen.getByRole('button', { name: 'Volver atrás' }));

        expect(screen.getByText('Página de inicio')).toBeTruthy();
    });

        it('sets the browser tab title', () => {
        renderNotFound(['/reto-de-ayer']);

        expect(document.title).toBe('Página no encontrada - Calculetra');
    });

    it('tells search engines not to index the page', () => {
        renderNotFound(['/reto-de-ayer']);

        const robots = document.head.querySelector('meta[name="robots"]');
        expect(robots?.getAttribute('content')).toBe('noindex');
    });
});