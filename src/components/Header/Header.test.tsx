// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import Header from './Header';

describe('Header', () => {
    afterEach(cleanup);

    it('links the title to the home page', () => {
        render(<MemoryRouter><Header /></MemoryRouter>);

        expect(screen.getByRole('link', { name: 'Calculetra' }).getAttribute('href')).toBe('/');
    });

    it('links "Crear cuenta" to the sign up page', () => {
        render(<MemoryRouter><Header /></MemoryRouter>);

        expect(screen.getByRole('link', { name: 'Crear cuenta' }).getAttribute('href')).toBe('/signup');
    });
});
