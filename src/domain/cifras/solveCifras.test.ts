import { describe, expect, it } from 'vitest';
import { applyOperation } from './operation';
import { getDailyChallenge } from './challengeCifras';
import { solveCifras, type SolverStep } from './solveCifras';

// Plays a solution with the starting numbers, following the game rules,
// and returns the last result (or the best starting number when there are no steps).
function play(numbers: Array<number>, steps: Array<SolverStep>): number {
  const available = [...numbers];

  for (const step of steps) {
    for (const operand of [step.left, step.right]) {
      const index = available.indexOf(operand);
      expect(index, `${operand} is not available`).not.toBe(-1);
      available.splice(index, 1);
    }
    const result = applyOperation(step.left, step.operator, step.right);
    expect(result).toEqual({ ok: true, value: step.result });
    available.push(step.result);
  }

  return steps.at(-1)?.result ?? NaN;
}

describe('solveCifras', () => {
  it('finds an exact solution when there is one', () => {
    const result = solveCifras([100, 2, 1], 102);

    expect(result.value).toBe(102);
    expect(result.solutions.length).toBeGreaterThan(0);
  });

  it('only gives the shortest solutions', () => {
    // 100 + 2 is one step; nothing needs more.
    const result = solveCifras([100, 2, 1], 102);

    for (const steps of result.solutions) {
      expect(steps).toHaveLength(1);
    }
  });

  it('finds the closest result when the target can not be reached', () => {
    // With six 1s the biggest number is (1 + 1 + 1) × (1 + 1 + 1) = 9.
    const result = solveCifras([1, 1, 1, 1, 1, 1], 999);

    expect(result.value).toBe(9);
    for (const steps of result.solutions) {
      expect(play([1, 1, 1, 1, 1, 1], steps)).toBe(9);
    }
  });

  it('picks the smaller one on a tie, like getBestValue', () => {
    // 20 and 30 are both 5 away from 25, and 20 is already there without any step.
    const result = solveCifras([10, 20], 25);

    expect(result.value).toBe(20);
    expect(result.solutions).toEqual([[]]);
  });

  it('never divides when the division is not exact', () => {
    // 7 ÷ 2 would be 3.5, closer to 3 than anything else, but it is not allowed.
    const result = solveCifras([7, 2], 3);

    expect(result.value).toBe(2);
  });

  it('never gives a result that is not positive', () => {
    // 2 - 7 would be -5, which is the target, but it is not allowed.
    const result = solveCifras([2, 7], -5);

    for (const steps of result.solutions) {
      for (const step of steps) expect(step.result).toBeGreaterThan(0);
    }
    expect(result.value).toBe(2);
  });

  it('gives solutions that can be played with the rules of the game', () => {
    const { numbers, target } = getDailyChallenge(new Date('2026-11-12T12:00:00Z'));
    const result = solveCifras(numbers, target);

    expect(result.solutions.length).toBeGreaterThan(0);
    for (const steps of result.solutions) {
      expect(play(numbers, steps)).toBe(result.value);
    }
  });

  it('gives the same solutions in the same order every time', () => {
    const { numbers, target } = getDailyChallenge(new Date('2026-11-12T12:00:00Z'));

    expect(solveCifras(numbers, target)).toEqual(solveCifras(numbers, target));
  });
});
