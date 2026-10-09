// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import UnderConstruction from './UnderDevelopment';

describe('UnderConstruction', () => {
    beforeEach(() => {
        render(<UnderConstruction />);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders inside a main landmark', () => {
        expect(screen.getByRole('main')).toBeTruthy();
    });

    it('shows the badge', () => {
        expect(screen.getByText('🚧 En construcción')).toBeTruthy();
    });

    it('has a single level 1 heading named "Calculetra"', () => {
        const headings = screen.getAllByRole('heading', { level: 1 });

        expect(headings).toHaveLength(1);
        expect(headings[0].getAttribute('aria-label')).toBe('Calculetra');
    });

    it('spells CALCULETRA with one tile per letter', () => {
        const heading = screen.getByRole('heading', { level: 1 });
        const tiles = heading.querySelectorAll('span');

        expect(tiles).toHaveLength(10);
        expect(heading.textContent).toBe('CALCULETRA');
    });

    it('hides the letter tiles from screen readers', () => {
        const heading = screen.getByRole('heading', { level: 1 });

        heading.querySelectorAll('span').forEach((tile) => {
            expect(tile.getAttribute('aria-hidden')).toBe('true');
        });
    });

    it('shows the six number tiles in order', () => {
        const list = document.querySelector('ul');
        const numbers = Array.from(list?.querySelectorAll('li') ?? [], (li) => li.textContent);

        expect(numbers).toEqual(['100', '75', '50', '25', '8', '3']);
    });

    it('hides the number tiles from screen readers', () => {
        expect(document.querySelector('ul')?.getAttribute('aria-hidden')).toBe('true');
        expect(screen.queryByRole('list')).toBeNull();
    });

    it('explains that the game is coming soon', () => {
        expect(screen.getByText('Estamos preparando el reto diario de cifras y letras.')).toBeTruthy();
        expect(screen.getByText(/Vuelve pronto para jugar/)).toBeTruthy();
    });

    it('links to the GitHub repository in a new tab, safely', () => {
        const link = screen.getByRole('link', { name: 'Sigue el desarrollo en GitHub' });

        expect(link.getAttribute('href')).toBe('https://github.com/MatiCoding/calculetra');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toContain('noopener');
        expect(link.getAttribute('rel')).toContain('noreferrer');
    });

    it('has no other links or buttons', () => {
        const main = screen.getByRole('main');

        expect(within(main).getAllByRole('link')).toHaveLength(1);
        expect(within(main).queryAllByRole('button')).toHaveLength(0);
    });
});
