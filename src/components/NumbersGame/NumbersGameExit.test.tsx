// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { magnetTime } from '../magnet';
import NumbersGame from './NumbersGame';

function magnets() {
    return screen.queryAllByTestId('exit-magnet');
}

function numberButtons() {
    return within(screen.getByRole('list', { name: 'Números' })).getAllByRole('button');
}

describe('NumbersGame exit', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-10-14T10:00:00Z'));
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('has no exit circles while playing', () => {
        render(<NumbersGame />);

        expect(magnets()).toHaveLength(0);
    });

    it('puts one circle on each tile, each one a bit later than the one before', () => {
        render(<NumbersGame leaving />);

        expect(magnets().map((magnet) => magnet.style.animationDelay))
            .toEqual(['0ms', '40ms', '80ms', '120ms', '160ms', '200ms']);
    });

    it('calls onLeft when the last circle has covered the screen, not before', () => {
        const onLeft = vi.fn();
        render(<NumbersGame leaving onLeft={onLeft} />);

        act(() => {
            vi.advanceTimersByTime(magnetTime(6) - 1);
        });
        expect(onLeft).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(onLeft).toHaveBeenCalledTimes(1);
    });

    it('does not call onLeft while playing', () => {
        const onLeft = vi.fn();
        render(<NumbersGame onLeft={onLeft} />);

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(onLeft).not.toHaveBeenCalled();
    });

    it('cannot be played while it leaves', () => {
        render(<NumbersGame leaving />);

        expect(numberButtons()[0].closest('[inert]')).not.toBeNull();
    });
});
