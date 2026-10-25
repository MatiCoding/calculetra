// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
    afterEach(cleanup);

    it('links to the privacy policy', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>,
        );

        const link = screen.getByRole('link', { name: 'Privacidad' });
        expect(link.getAttribute('href')).toBe('/privacy');
    });
});
