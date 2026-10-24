// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { fakeDialog } from '../../test/fakeDialog';
import NoticeDialog from './NoticeDialog';

// initialEntries can be an object with state, as if another page had called
// navigate('/', { state }).
function renderWithState(state: unknown) {
    render(
        <MemoryRouter initialEntries={[{ pathname: '/', state }]}>
            <NoticeDialog />
        </MemoryRouter>,
    );
}

describe('NoticeDialog', () => {
    beforeAll(fakeDialog);

    afterEach(cleanup);

    it('opens a dialog with the notice from the navigation state', () => {
        renderWithState({ notice: 'Tu cuenta se ha eliminado.' });

        const dialog = screen.getByRole('dialog', { name: 'Tu cuenta se ha eliminado.' });
        expect(dialog.hasAttribute('open')).toBe(true);
    });

    it('shows nothing without state', () => {
        renderWithState(null);

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('shows nothing when the notice is not a string', () => {
        renderWithState({ notice: 42 });

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes the dialog with the button', () => {
        renderWithState({ notice: 'Tu cuenta se ha eliminado.' });

        fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('removes the notice when the browser closes the dialog (Escape)', () => {
        renderWithState({ notice: 'Tu cuenta se ha eliminado.' });

        // Escape closes a modal dialog by itself and fires "close".
        fireEvent(screen.getByRole('dialog'), new Event('close'));

        expect(screen.queryByRole('dialog')).toBeNull();
    });
});