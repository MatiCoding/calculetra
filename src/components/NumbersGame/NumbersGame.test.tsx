// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDailyChallenge } from '../../domain/cifras/challengeCifras';
import { gameReducer, initialState } from '../../domain/cifras/gameCifras';
import { applyOperation } from '../../domain/cifras/operation';
import { previewKind } from '../../domain/cifras/previewCifras';
import { calculateScore, getBestValue } from '../../domain/cifras/scoreCifras';
import type { Challenge } from '../../domain/cifras/typesCifras';
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

// The steps shown in the tree, from the top of each tree down.
// The tree is not rendered while there are no steps.
function stepTexts() {
    const list = screen.queryByRole('list', { name: 'Cómo has llegado' });
    if (list === null) return [];
    return within(list).queryAllByRole('group').map((group) => group.getAttribute('aria-label'));
}

// The preview label above each number, or null if it has none.
function previewOf(index: number) {
    const item = numberButtons()[index].closest('li');
    return item?.querySelector('[data-kind]') ?? null;
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

    it('shows no preview until a number and an operator are chosen', () => {
        render(<NumbersGame />);

        clickNumber(0);

        expect(challenge.numbers.map((_, index) => previewOf(index))).toEqual(challenge.numbers.map(() => null));
    });

    it('shows above every other number the result it would give', () => {
        render(<NumbersGame />);
        const [first, ...others] = challenge.numbers;

        clickNumber(0);
        clickButton('Sumar');

        expect(previewOf(0)).toBeNull();
        others.forEach((value, index) => {
            const preview = previewOf(index + 1);
            expect(preview?.textContent).toBe(`= ${first + value}`);
            expect(preview?.getAttribute('data-kind')).toBe(
                previewKind({ ok: true, value: first + value }, challenge.target),
            );
        });
    });

    it('says "no vale" above a number when the operation is not allowed', () => {
        render(<NumbersGame />);
        const smallest = challenge.numbers.indexOf(Math.min(...challenge.numbers));
        const biggest = challenge.numbers.indexOf(Math.max(...challenge.numbers));

        clickNumber(smallest);
        clickButton('Restar');

        expect(previewOf(biggest)?.textContent).toBe('no vale');
        expect(previewOf(biggest)?.getAttribute('data-kind')).toBe('invalid');
    });

    it('updates the preview when the operator changes', () => {
        render(<NumbersGame />);
        const [a, b] = challenge.numbers;
        const product = applyOperation(a, '×', b);

        clickNumber(0);
        clickButton('Sumar');
        clickButton('Multiplicar');

        expect(previewOf(1)?.textContent).toBe(product.ok ? `= ${product.value}` : 'no vale');
    });

    it('hides the preview after the operation is made', () => {
        render(<NumbersGame />);

        playFirstSum();

        expect(numberButtons().map((_, index) => previewOf(index)).every((preview) => preview === null)).toBe(true);
    });

    it('shows the tree below the operators and above the buttons', () => {
        render(<NumbersGame />);
        const operators = screen.getByRole('group', { name: 'Operaciones' });
        const tree = screen.getByRole('region', { name: 'Cómo has llegado' });
        const undo = screen.getByRole('button', { name: 'Deshacer' });

        expect(operators.compareDocumentPosition(tree) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(tree.compareDocumentPosition(undo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('shows the steps as a tree', () => {
        render(<NumbersGame />);
        const [a, b, c] = challenge.numbers;

        playFirstSum();
        // The result is now the last number; add the next starting number to it.
        clickNumber(numberButtons().length - 1);
        clickButton('Sumar');
        clickNumber(0);

        expect(stepTexts()).toEqual([`${a + b} + ${c} = ${a + b + c}`, `${a} + ${b} = ${a + b}`]);
    });

    it('undoes a branch when a result in the tree is tapped', () => {
        render(<NumbersGame />);
        const [a, b, c, d] = challenge.numbers;

        playFirstSum();
        // Now numbers[2] and numbers[3] are the first two numbers on the board.
        playFirstSum();
        clickButton(`Deshacer ${a} + ${b} = ${a + b}`);

        expect(numberValues()).toEqual([a, b, ...challenge.numbers.slice(4), c + d]);
        expect(stepTexts()).toEqual([`${c} + ${d} = ${c + d}`]);
    });

    it('does not let the player undo from the tree after finishing', () => {
        render(<NumbersGame />);
        const [a, b] = challenge.numbers;

        playFirstSum();
        clickButton('Terminar');

        const result = screen.getByRole('button', { name: `Deshacer ${a} + ${b} = ${a + b}` }) as HTMLButtonElement;
        expect(result.disabled).toBe(true);
    });

    it('tells the player what to do', () => {
        render(<NumbersGame />);
        const hint = () => screen.getByRole('status').textContent;
        const [a] = challenge.numbers;

        expect(hint()).toBe('Elige un número.');
        clickNumber(0);
        expect(hint()).toBe(`Elige qué hacer con ${a}.`);
        clickButton('Sumar');
        expect(hint()).toBe('Encima de cada número ves lo que daría. Toca uno.');
    });

    it('tells the player that a number can be swapped once there is a tree', () => {
        render(<NumbersGame />);
        const c = challenge.numbers[2];

        playFirstSum();
        clickNumber(0);

        expect(screen.getByRole('status').textContent).toBe(
            `Elige qué hacer con ${c}, o toca un número del árbol para cambiarlo por ${c}.`,
        );
    });

    it('swaps a number by tapping it on the board and then in the tree', () => {
        render(<NumbersGame />);
        const [a, b, c] = challenge.numbers;

        playFirstSum();
        // numbers[2] is now the first number on the board.
        clickNumber(0);
        clickButton(`Cambiar ${b} por ${c}`);

        expect(stepTexts()).toEqual([`${a} + ${c} = ${a + c}`]);
        expect(numberValues()).toEqual([b, ...challenge.numbers.slice(3), a + c]);
        expect(screen.queryByRole('button', { name: /^Cambiar/ })).toBeNull();
    });

    it('highlights nothing in the tree until a free starting number is selected', () => {
        render(<NumbersGame />);

        playFirstSum();
        expect(screen.queryByRole('button', { name: /^Cambiar/ })).toBeNull();

        // The result of the sum is not a starting number.
        clickNumber(numberButtons().length - 1);
        expect(screen.queryByRole('button', { name: /^Cambiar/ })).toBeNull();
    });

    it('explains why a swap does not work and changes nothing', () => {
        render(<NumbersGame />);
        const byValue = challenge.numbers.map((value, index) => ({ value, index })).toSorted((x, y) => x.value - y.value);
        const smallest = byValue[0];
        const secondBiggest = byValue[4];
        const biggest = byValue[5];

        // secondBiggest − smallest is fine, but secondBiggest − biggest is not.
        clickNumber(secondBiggest.index);
        clickButton('Restar');
        clickNumber(smallest.index);
        const before = stepTexts();
        const valuesBefore = numberValues();
        clickNumber(numberValues().indexOf(biggest.value));
        clickButton(`Cambiar ${smallest.value} por ${biggest.value}`);

        expect(screen.getByRole('alert').textContent).toBe(
            `Con ${biggest.value} no sale: el resultado tiene que ser mayor que 0.`,
        );
        expect(stepTexts()).toEqual(before);
        expect(numberValues()).toEqual(valuesBefore);
    });

    it('hides the message of a failed swap when the player does something else', () => {
        render(<NumbersGame />);
        const byValue = challenge.numbers.map((value, index) => ({ value, index })).toSorted((x, y) => x.value - y.value);
        const [smallest, , , , secondBiggest, biggest] = byValue;

        clickNumber(secondBiggest.index);
        clickButton('Restar');
        clickNumber(smallest.index);
        clickNumber(numberValues().indexOf(biggest.value));
        clickButton(`Cambiar ${smallest.value} por ${biggest.value}`);
        clickNumber(0);

        expect(screen.queryByRole('alert')).toBeNull();
    });

    describe('dragging a number onto the tree', () => {
        const elementFromPoint = document.elementFromPoint;

        afterEach(() => {
            document.elementFromPoint = elementFromPoint;
        });

        // jsdom does not lay out the page, so the element under the pointer is faked.
        function pointAt(element: Element | null) {
            document.elementFromPoint = vi.fn(() => element);
        }

        function dragNumber(index: number, onto: () => Element | null) {
            const tile = numberButtons()[index];
            fireEvent.pointerDown(tile, { clientX: 10, clientY: 10 });
            // The first move starts the drag, and the numbers of the tree can then be found.
            pointAt(null);
            fireEvent.pointerMove(window, { clientX: 30, clientY: 30 });
            pointAt(onto());
            fireEvent.pointerMove(window, { clientX: 200, clientY: 300 });
            fireEvent.pointerUp(window, { clientX: 200, clientY: 300 });
            // A real browser also sends a click after the pointer goes up.
            fireEvent.click(tile);
        }

        it('swaps the numbers when it is dropped on a starting number of the tree', () => {
            render(<NumbersGame />);
            const [a, b, c] = challenge.numbers;

            playFirstSum();
            dragNumber(0, () => screen.getByRole('button', { name: `Cambiar ${b} por ${c}` }));

            expect(stepTexts()).toEqual([`${a} + ${c} = ${a + c}`]);
            // The click after the drag does not select the tile.
            expect(numberButtons().every((button) => button.getAttribute('aria-pressed') === 'false')).toBe(true);
        });

        it('highlights the numbers of the tree while dragging', () => {
            render(<NumbersGame />);
            const [a, , c] = challenge.numbers;

            playFirstSum();
            fireEvent.pointerDown(numberButtons()[0], { clientX: 10, clientY: 10 });
            pointAt(null);
            fireEvent.pointerMove(window, { clientX: 40, clientY: 40 });

            expect(screen.getByRole('button', { name: `Cambiar ${a} por ${c}` })).toBeTruthy();

            fireEvent.pointerUp(window, { clientX: 40, clientY: 40 });
            expect(screen.queryByRole('button', { name: /^Cambiar/ })).toBeNull();
        });

        it('changes nothing when it is dropped outside the tree', () => {
            render(<NumbersGame />);

            playFirstSum();
            const before = stepTexts();
            dragNumber(0, () => null);

            expect(stepTexts()).toEqual(before);
        });

        it('does not drag a calculated result', () => {
            render(<NumbersGame />);

            playFirstSum();
            fireEvent.pointerDown(numberButtons()[numberButtons().length - 1], { clientX: 10, clientY: 10 });
            pointAt(null);
            fireEvent.pointerMove(window, { clientX: 40, clientY: 40 });

            expect(screen.queryByRole('button', { name: /^Cambiar/ })).toBeNull();
            fireEvent.pointerUp(window);
        });

        it('treats a press that barely moves as a normal tap', () => {
            render(<NumbersGame />);

            playFirstSum();
            const tile = numberButtons()[0];
            pointAt(null);
            fireEvent.pointerDown(tile, { clientX: 10, clientY: 10 });
            fireEvent.pointerMove(window, { clientX: 12, clientY: 11 });
            fireEvent.pointerUp(window, { clientX: 12, clientY: 11 });
            fireEvent.click(tile);

            expect(numberButtons()[0].getAttribute('aria-pressed')).toBe('true');
        });
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

        const result = screen.getByRole('region', { name: 'Resultado' });
        const valueOf = (label: string) => within(result).getByText(label).nextElementSibling?.textContent;

        expect(valueOf('Puntos')).toBe(String(calculateScore(challenge.target, best)));
        expect(valueOf('Mejor número')).toBe(String(best));
        expect(valueOf('Distancia')).toBe(String(distance));
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

        expect(screen.queryByRole('region', { name: 'Resultado' })).toBeNull();
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
