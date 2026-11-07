// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { gameReducer, initialState } from '../../domain/cifras/gameCifras';
import { buildTree } from '../../domain/cifras/treeCifras';
import type { Challenge, GameState, Operator } from '../../domain/cifras/typesCifras';
import SolutionTree from './SolutionTree';

const challenge: Challenge = { numbers: [100, 75, 50, 25, 8, 3], target: 325 };

function idOf(state: GameState, value: number): number {
    const tile = state.tiles.find((tile) => tile.value === value);
    if (!tile) {
        throw new Error(`No tile with value ${value}`);
    }
    return tile.id;
}

function play(state: GameState, a: number, operator: Operator, b: number): GameState {
    const withFirst = gameReducer(state, { type: 'selectTile', id: idOf(state, a) });
    const withOperator = gameReducer(withFirst, { type: 'selectOperator', operator });
    return gameReducer(withOperator, { type: 'selectTile', id: idOf(withOperator, b) });
}

type Options = Partial<Omit<ComponentProps<typeof SolutionTree>, 'trees'>>;

function renderTree(state: GameState, options: Options = {}) {
    render(
        <SolutionTree
            trees={buildTree(state.steps)}
            onUndo={() => {}}
            swapTile={null}
            onSwap={() => {}}
            overId={null}
            freshId={null}
            changedIds={[]}
            shake={false}
            disabled={false}
            {...options}
        />,
    );
}

// The steps of the tree, from the top of each tree down.
function stepLabels() {
    return screen.getAllByRole('group').map((group) => group.getAttribute('aria-label'));
}

describe('SolutionTree', () => {
    afterEach(() => {
        cleanup();
    });

    it('shows the box with a hint when there are no steps', () => {
        renderTree(initialState(challenge));

        expect(screen.getByRole('region', { name: 'Cómo has llegado' })).toBeTruthy();
        expect(screen.queryByRole('list', { name: 'Cómo has llegado' })).toBeNull();
    });

    it('shows a step with its result, its operator and the two numbers used', () => {
        renderTree(play(initialState(challenge), 100, '×', 3));

        const step = screen.getByRole('group', { name: '100 × 3 = 300' });
        expect(step.textContent).toBe('300100×3');
    });

    it('puts a result used again inside the step that used it', () => {
        const first = play(initialState(challenge), 100, '×', 3);
        renderTree(play(first, 300, '+', 25));

        const outer = screen.getByRole('group', { name: '300 + 25 = 325' });
        expect(within(outer).getByRole('group', { name: '100 × 3 = 300' })).toBeTruthy();
        expect(stepLabels()).toEqual(['300 + 25 = 325', '100 × 3 = 300']);
    });

    it('shows one tree for each result not used again', () => {
        const first = play(initialState(challenge), 100, '×', 3);
        renderTree(play(first, 50, '+', 8));

        const list = screen.getByRole('list', { name: 'Cómo has llegado' });
        expect(within(list).getAllByRole('listitem')).toHaveLength(2);
        expect(stepLabels()).toEqual(['100 × 3 = 300', '50 + 8 = 58']);
    });

    it('asks to undo a result when it is tapped', () => {
        const onUndo = vi.fn();
        const first = play(initialState(challenge), 100, '×', 3);
        const state = play(first, 300, '+', 25);
        renderTree(state, { onUndo });

        fireEvent.click(screen.getByRole('button', { name: 'Deshacer 100 × 3 = 300' }));

        expect(onUndo).toHaveBeenCalledWith(idOf(first, 300));
    });

    it('does not let the starting numbers be tapped to undo', () => {
        renderTree(play(initialState(challenge), 100, '×', 3));

        expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual([
            'Deshacer 100 × 3 = 300',
        ]);
    });

    it('disables the results when it is disabled', () => {
        renderTree(play(initialState(challenge), 100, '×', 3), { disabled: true });

        expect((screen.getByRole('button', { name: 'Deshacer 100 × 3 = 300' }) as HTMLButtonElement).disabled).toBe(true);
    });

    it('lets the starting numbers be swapped when there is a number to swap them for', () => {
        const onSwap = vi.fn();
        const first = play(initialState(challenge), 100, '×', 3);
        renderTree(play(first, 300, '+', 25), { swapTile: { id: 4, value: 8 }, onSwap });

        expect(screen.getByRole('button', { name: 'Cambiar 100 por 8' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Cambiar 3 por 8' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Cambiar 25 por 8' })).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Cambiar 25 por 8' }));
        expect(onSwap).toHaveBeenCalledWith(challenge.numbers.indexOf(25));
    });

    it('does not let the results be swapped', () => {
        renderTree(play(initialState(challenge), 100, '×', 3), { swapTile: { id: 4, value: 8 } });

        expect(screen.queryByRole('button', { name: 'Cambiar 300 por 8' })).toBeNull();
    });

    it('does not let anything be swapped when there is no number to swap', () => {
        renderTree(play(initialState(challenge), 100, '×', 3));

        expect(screen.queryByRole('button', { name: /^Cambiar/ })).toBeNull();
    });

    it('marks each swappable number with its id, so a dragged tile can find it', () => {
        renderTree(play(initialState(challenge), 100, '×', 3), { swapTile: { id: 4, value: 8 } });

        expect(screen.getByRole('button', { name: 'Cambiar 100 por 8' }).getAttribute('data-leaf')).toBe(
            String(challenge.numbers.indexOf(100)),
        );
    });

    // CSS modules add a hash to each class name, so the tests look for the name inside it.
    it('marks the newest result so it grows into the tree', () => {
        const first = play(initialState(challenge), 100, '×', 3);
        const state = play(first, 300, '+', 25);
        renderTree(state, { freshId: state.steps[1].result.id });

        expect(screen.getByRole('group', { name: '300 + 25 = 325' }).className).toMatch(/fresh/);
        expect(screen.getByRole('group', { name: '100 × 3 = 300' }).className).not.toMatch(/fresh/);
    });

    it('marks the numbers that changed in the last swap so they flash', () => {
        const state = play(initialState(challenge), 100, '×', 3);
        renderTree(state, { changedIds: [state.steps[0].result.id] });

        expect(screen.getByRole('button', { name: 'Deshacer 100 × 3 = 300' }).className).toMatch(/changed/);
    });

    it('shakes the tree after a swap that does not work', () => {
        renderTree(play(initialState(challenge), 100, '×', 3), { shake: true });

        expect(screen.getByRole('list', { name: 'Cómo has llegado' }).className).toMatch(/shake/);
    });
});
