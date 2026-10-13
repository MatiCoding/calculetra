// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDailyChallenge } from '../../domain/cifras/challenge';
import { gameReducer, initialState } from '../../domain/cifras/game';
import { calculateScore, getBestValue } from '../../domain/cifras/score';
import type { Challenge } from '../../domain/cifras/types';
import NumbersGame from './NumbersGame';

// The challenge depends on today's date, so the tests fix the date.
// Only Date is faked: fireEvent is synchronous and needs no timers.
const TODAY = new Date('2026-10-14T10:00:00Z');

let challenge: Challenge;

function numberButtons() {
    return within(screen.getByRole('list', { name: 'Números' })).getAllByRole('button');
}

function numberValues() {
    return numberButtons().map((button) => Number(button.textContent));
}

// The steps list may not be rendered while there are no steps.
function stepTexts() {
    const list = screen.queryByRole('list', { name: 'Pasos' });
    if (list === null) return [];
    return within(list).queryAllByRole('listitem').map((item) => item.textContent);
}

function clickNumber(index: number) {
    fireEvent.click(numberButtons()[index]);
}

function clickButton(name: string) {
    fireEvent.click(screen.getByRole('button', { name }));
}

// Plays numbers[0] + numbers[1], which is always a valid operation.
function playFirstSum() {
    clickNumber(0);
    clickButton('Sumar');
    clickNumber(1);
}

describe('NumbersGame', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(TODAY);
        challenge = getDailyChallenge(TODAY);
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it("shows today's target and numbers", () => {
        render(<NumbersGame />);

        expect(screen.getByRole('heading', { name: `Objetivo: ${challenge.target}` })).toBeTruthy();
        expect(numberValues()).toEqual(challenge.numbers);
    });

    it('marks the selected number and operator', () => {
        render(<NumbersGame />);

        clickNumber(0);
        expect(numberButtons()[0].getAttribute('aria-pressed')).toBe('true');
        expect(numberButtons()[1].getAttribute('aria-pressed')).toBe('false');

        clickButton('Sumar');
        expect(screen.getByRole('button', { name: 'Sumar' }).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('button', { name: 'Restar' }).getAttribute('aria-pressed')).toBe('false');
    });

    it('combines two numbers and lists the step', () => {
        render(<NumbersGame />);
        const [a, b] = challenge.numbers;

        playFirstSum();

        expect(numberValues()).toEqual([...challenge.numbers.slice(2), a + b]);
        expect(stepTexts()).toEqual([`${a} + ${b} = ${a + b}`]);
        // The selection is cleared after the operation.
        expect(numberButtons().every((button) => button.getAttribute('aria-pressed') === 'false')).toBe(true);
    });

    it('shows a message when a subtraction is not positive', () => {
        render(<NumbersGame />);
        const smallest = challenge.numbers.indexOf(Math.min(...challenge.numbers));
        const biggest = challenge.numbers.indexOf(Math.max(...challenge.numbers));

        clickNumber(smallest);
        clickButton('Restar');
        clickNumber(biggest);

        expect(screen.getByRole('alert').textContent).toMatch(/mayor que 0/i);
        expect(numberValues()).toEqual(challenge.numbers);
        expect(stepTexts()).toEqual([]);
    });

    it('shows a message when a division is not exact', () => {
        render(<NumbersGame />);
        const pair = findNotExactDivision(challenge.numbers);

        clickNumber(pair.left);
        clickButton('Dividir');
        clickNumber(pair.right);

        expect(screen.getByRole('alert').textContent).toMatch(/exacta/i);
    });

    it('hides the message when the player selects a number again', () => {
        render(<NumbersGame />);
        const smallest = challenge.numbers.indexOf(Math.min(...challenge.numbers));
        const biggest = challenge.numbers.indexOf(Math.max(...challenge.numbers));

        clickNumber(smallest);
        clickButton('Restar');
        clickNumber(biggest);
        clickNumber(0);

        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('undoes the last step', () => {
        render(<NumbersGame />);
        const undo = screen.getByRole('button', { name: 'Deshacer' }) as HTMLButtonElement;
        expect(undo.disabled).toBe(true);

        playFirstSum();
        expect(undo.disabled).toBe(false);
        clickButton('Deshacer');

        expect(numberValues()).toEqual(challenge.numbers);
        expect(stepTexts()).toEqual([]);
        expect(undo.disabled).toBe(true);
    });

    it('resets the game', () => {
        render(<NumbersGame />);

        playFirstSum();
        playFirstSum();
        expect(stepTexts()).toHaveLength(2);
        clickButton('Reiniciar');

        expect(numberValues()).toEqual(challenge.numbers);
        expect(stepTexts()).toEqual([]);
    });

    it('shows the best number, the distance and the score when the player finishes', () => {
        render(<NumbersGame />);
        // The same actions, played with the reducer, give the expected result.
        let state = initialState(challenge);
        state = gameReducer(state, { type: 'selectTile', id: 0 });
        state = gameReducer(state, { type: 'selectOperator', operator: '+' });
        state = gameReducer(state, { type: 'selectTile', id: 1 });
        const best = getBestValue(state);
        const distance = Math.abs(best - challenge.target);

        playFirstSum();
        clickButton('Terminar');

        expect(screen.getByText(`Mejor número: ${best}`)).toBeTruthy();
        expect(screen.getByText(`Distancia: ${distance}`)).toBeTruthy();
        expect(screen.getByText(`Puntos: ${calculateScore(challenge.target, best)}`)).toBeTruthy();
    });

    it('does not let the player keep playing after finishing', () => {
        render(<NumbersGame />);

        clickButton('Terminar');

        expect(numberButtons().every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
        for (const name of ['Sumar', 'Restar', 'Multiplicar', 'Dividir', 'Deshacer', 'Terminar']) {
            expect((screen.getByRole('button', { name }) as HTMLButtonElement).disabled).toBe(true);
        }
        expect((screen.getByRole('button', { name: 'Reiniciar' }) as HTMLButtonElement).disabled).toBe(false);
    });

    it('can play again after finishing', () => {
        render(<NumbersGame />);

        clickButton('Terminar');
        clickButton('Reiniciar');

        expect(screen.queryByText(/Mejor número/)).toBeNull();
        expect(numberButtons().every((button) => !(button as HTMLButtonElement).disabled)).toBe(true);
    });
});

// Finds two positions whose division is not exact (for example 7 ÷ 2).
function findNotExactDivision(numbers: number[]) {
    for (let left = 0; left < numbers.length; left++) {
        for (let right = 0; right < numbers.length; right++) {
            if (left !== right && numbers[left] % numbers[right] !== 0) {
                return { left, right };
            }
        }
    }
    throw new Error(`No division that is not exact in ${numbers.join(', ')}`);
}
