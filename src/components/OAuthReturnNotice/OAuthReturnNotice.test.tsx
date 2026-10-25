// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import OAuthReturnNotice from './OAuthReturnNotice';

// Shows the current URL and the notice saved in the history state, so the
// tests can read them.
function ShowLocation() {
    const { pathname, search, hash, state } = useLocation();
    return (
        <>
            <p data-testid="url">{pathname + search + hash}</p>
            <p data-testid="notice">{state?.notice ?? 'sin aviso'}</p>
        </>
    );
}

function renderAt(url: string) {
    render(
        <MemoryRouter initialEntries={[url]}>
            <OAuthReturnNotice />
            <ShowLocation />
        </MemoryRouter>,
    );
}

describe('OAuthReturnNotice', () => {
    afterEach(cleanup);

    it('leaves the URL alone when there is no error', () => {
        renderAt('/?page=2');

        expect(screen.getByTestId('url').textContent).toBe('/?page=2');
        expect(screen.getByTestId('notice').textContent).toBe('sin aviso');
    });

    it('removes the error from the URL without a notice when the user cancelled', async () => {
        renderAt('/#error=access_denied&error_description=The+user+denied+access');

        await waitFor(() => expect(screen.getByTestId('url').textContent).toBe('/'));
        expect(screen.getByTestId('notice').textContent).toBe('sin aviso');
    });

    it('removes the error from the URL and leaves a notice when the provider fails', async () => {
        renderAt('/#error=server_error&error_description=Unable+to+exchange+external+code');

        await waitFor(() => expect(screen.getByTestId('url').textContent).toBe('/'));
        expect(screen.getByTestId('notice').textContent).toBe(
            'No se ha podido iniciar sesión con tu cuenta externa. Inténtalo de nuevo o entra con tu email.',
        );
    });
});