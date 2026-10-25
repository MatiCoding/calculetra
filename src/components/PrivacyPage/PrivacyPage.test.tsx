// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import PrivacyPage from './PrivacyPage';

function renderPrivacyPage() {
    render(
        <MemoryRouter>
            <PrivacyPage />
        </MemoryRouter>,
    );
}

describe('PrivacyPage', () => {
    afterEach(cleanup);

    it('shows the title', () => {
        renderPrivacyPage();

        expect(screen.getByRole('heading', { level: 1, name: 'Política de privacidad' })).toBeTruthy();
    });

    it('says which data is stored', () => {
        renderPrivacyPage();

        expect(screen.getAllByText(/correo/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Google/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/GitHub/).length).toBeGreaterThan(0);
    });

    it('names who processes the data', () => {
        renderPrivacyPage();

        expect(screen.getAllByText(/Supabase/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Vercel/).length).toBeGreaterThan(0);
    });

    it('links to the account page to delete the account', () => {
        renderPrivacyPage();

        const link = screen.getByRole('link', { name: /Mi cuenta/ });
        expect(link.getAttribute('href')).toBe('/account');
    });

    it('shows a contact email', () => {
        renderPrivacyPage();

        const link = screen.getByRole('link', { name: 'mateorz2308@gmail.com' });
        expect(link.getAttribute('href')).toBe('mailto:mateorz2308@gmail.com');
    });
});
