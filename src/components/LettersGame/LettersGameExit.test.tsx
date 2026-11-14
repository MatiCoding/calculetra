// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDailyLetters } from '../../domain/letras/challengeLetras';
import { magnetTime } from '../magnet';
import LettersGame from './LettersGame';

// The letters depend on today's date, so the tests fix the date.
const TODAY = new Date('2026-10-14T10:00:00Z');

function magnets() {
    return screen.queryAllByTestId('exit-magnet');
}

function letterButtons() {
    return within(screen.getByRole('list', { name: 'Letras' })).getAllByRole('button');
}

function board() {
    return screen.getByRole('status', { name: 'Tu palabra' });
}

// Lets the dictionary load and the keys stop spinning.
async function waitUntilReady() {
    await waitFor(() => expect(screen.queryByText('Cargando diccionario...')).toBeNull());
    act(() => {
        vi.advanceTimersByTime(5000);
    });
}

describe('LettersGame exit', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'], shouldAdvanceTime: true });
        vi.setSystemTime(TODAY);
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('has no exit circles while playing', () => {
        render(<LettersGame loadWords={async () => new Set()} />);

        expect(magnets()).toHaveLength(0);
    });

    it('puts one circle on each key, each one a bit later than the one before', () => {
        render(<LettersGame loadWords={async () => new Set()} leaving />);

        expect(magnets().map((magnet) => magnet.style.animationDelay))
            .toEqual(['0ms', '40ms', '80ms', '120ms', '160ms', '200ms', '240ms', '280ms', '320ms']);
    });

    it('calls onLeft when the last circle has covered the screen, not before', () => {
        const onLeft = vi.fn();
        render(<LettersGame loadWords={async () => new Set()} leaving onLeft={onLeft} />);

        act(() => {
            vi.advanceTimersByTime(magnetTime(9) - 1);
        });
        expect(onLeft).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(onLeft).toHaveBeenCalledTimes(1);
    });

    it('does not call onLeft while playing', () => {
        const onLeft = vi.fn();
        render(<LettersGame loadWords={async () => new Set()} onLeft={onLeft} />);

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(onLeft).not.toHaveBeenCalled();
    });

    it('cannot be played while it leaves', async () => {
        const { rerender } = render(<LettersGame loadWords={async () => new Set()} />);
        await waitUntilReady();

        rerender(<LettersGame loadWords={async () => new Set()} leaving />);

        expect(letterButtons()[0].closest('[inert]')).not.toBeNull();
    });

    it('does not write with the keyboard while it leaves', async () => {
        const letters = getDailyLetters(TODAY);
        const { rerender } = render(<LettersGame loadWords={async () => new Set()} />);
        await waitUntilReady();

        rerender(<LettersGame loadWords={async () => new Set()} leaving />);
        fireEvent.keyDown(window, { key: letters[0] });

        expect(board().textContent).toBe('');
    });

    it('grows the circles out of the nine slots when the result is on screen', async () => {
        const { rerender } = render(<LettersGame loadWords={async () => new Set()} />);
        await waitUntilReady();
        letterButtons().slice(0, 3).forEach((key) => fireEvent.click(key));
        fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        rerender(<LettersGame loadWords={async () => new Set()} leaving />);

        expect(screen.queryByRole('list', { name: 'Letras' })).toBeNull();
        expect(magnets()).toHaveLength(9);
        magnets().forEach((magnet) => expect(magnet.parentElement?.dataset.testid).toBe('slot'));
    });
});
