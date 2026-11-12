import { describe, expect, it } from 'vitest';
import { applyOperation } from './operation';
import { getDailyChallenge } from './challengeCifras';
import { solveCifras, type SolverStep } from './solveCifras';
import { chooseSolution, nextHint } from './hintsCifras';

const DAY = new Date('2026-11-12T12:00:00Z');

// The numbers on the board after doing a step: the two used ones go, the result comes in.
function afterStep(values: Array<number>, step: SolverStep): Array<number> {
  const rest = [...values];
  rest.splice(rest.indexOf(step.left), 1);
  rest.splice(rest.indexOf(step.right), 1);
  return [...rest, step.result];
}

describe('chooseSolution', () => {
  const solutions: Array<Array<SolverStep>> = [
    [{ left: 100, operator: '+', right: 2, result: 102 }],
    [{ left: 100, operator: '+', right: 1, result: 101 }],
    [{ left: 50, operator: '×', right: 2, result: 100 }],
  ];

  it('picks one of the solutions', () => {
    expect(solutions).toContain(chooseSolution(solutions, DAY));
  });

  it('picks the same one all day long', () => {
    const morning = new Date('2026-11-12T07:00:00Z');
    const night = new Date('2026-11-12T21:00:00Z');

    expect(chooseSolution(solutions, morning)).toBe(chooseSolution(solutions, night));
  });

  it('can pick a different one on another day', () => {
    const days = ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'];
    const picked = days.map((day) => chooseSolution(solutions, new Date(`${day}T12:00:00Z`)));

    expect(new Set(picked).size).toBeGreaterThan(1);
  });

  it('returns null when there are no solutions', () => {
    expect(chooseSolution([], DAY)).toBeNull();
  });
});

describe('nextHint', () => {
  it('gives the first step of a shortest solution at the start', () => {
    const { numbers, target } = getDailyChallenge(DAY);
    const { value, solutions } = solveCifras(numbers, target);

    const hint = nextHint(numbers, target, value, DAY);

    expect(hint.kind).toBe('step');
    if (hint.kind !== 'step') return;
    expect(applyOperation(hint.step.left, hint.step.operator, hint.step.right)).toEqual({ ok: true, value: hint.step.result });
    expect(hint.stepsLeft).toBe(solutions[0].length);
  });

  it('keeps going from the board after a step, one step less each time', () => {
    const { numbers, target } = getDailyChallenge(DAY);
    const { value } = solveCifras(numbers, target);

    let board = numbers;
    let hint = nextHint(board, target, value, DAY);
    while (hint.kind === 'step') {
      const left = hint.stepsLeft;
      board = afterStep(board, hint.step);
      hint = nextHint(board, target, value, DAY);
      if (hint.kind === 'step') expect(hint.stepsLeft).toBe(left - 1);
    }

    expect(hint.kind).toBe('done');
    expect(board).toContain(value);
  });

  it('continues from the player operations when they can still reach the best value', () => {
    // 100 + 2 + 1 = 103: after 100 + 1 = 101, adding the 2 still reaches it.
    const hint = nextHint([2, 101], 103, 103, DAY);

    expect(hint).toEqual({ kind: 'step', step: { left: 101, operator: '+', right: 2, result: 103 }, stepsLeft: 1 });
  });

  it('says when the player operations can not reach the best value any more', () => {
    // From 100, 2 and 1 the target 102 can be reached, but not after 100 - 1 = 99.
    expect(nextHint([2, 99], 102, 102, DAY)).toEqual({ kind: 'unreachable' });
  });

  it('says when the best value is already on the board', () => {
    expect(nextHint([102, 1], 102, 102, DAY)).toEqual({ kind: 'done' });
  });
});
