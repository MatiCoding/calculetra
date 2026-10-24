// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import Notice from './Notice';

// initialEntries can be an object with state, as if another page had called
// navigate('/', { state }).
function renderWithState(state: unknown) {
    render(
        <MemoryRouter initialEntries={[{ pathname: '/', state }]}>
            <Notice />
        </MemoryRouter>,
    );
}

describe('Notice', () => {
    afterEach(cleanup);

    it('shows the notice from the navigation state', () => {
        renderWithState({ notice: 'Tu cuenta se ha eliminado.' });

        expect(screen.getByRole('status').textContent).toContain('Tu cuenta se ha eliminado.');
    });

    it('shows nothing without state', () => {
        renderWithState(null);

        expect(screen.queryByRole('status')).toBeNull();
    });

    it('shows nothing when the notice is not a string', () => {
        renderWithState({ notice: 42 });

        expect(screen.queryByRole('status')).toBeNull();
    });

    it('hides the notice when it is closed', () => {
        renderWithState({ notice: 'Tu cuenta se ha eliminado.' });

        fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

        expect(screen.queryByRole('status')).toBeNull();
    });
});