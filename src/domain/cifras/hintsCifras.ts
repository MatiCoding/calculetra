import { createRandom, hashString } from '../shared/random';
import { getDateKey } from '../shared/date';
import { solveCifras, type SolverStep } from './solveCifras';

export const MAX_HINTS_CIFRAS = 3;

// One of the solutions, at random but the same for every player on the same day.
export function chooseSolution(solutions: Array<Array<SolverStep>>, date: Date): Array<SolverStep> | null {
    if (solutions.length === 0) return null;
    const random = createRandom(hashString(`cifras-hints-${getDateKey(date)}`));
    return solutions[Math.floor(random() * solutions.length)];
}

export type NextHint =
    | { kind: 'step', step: SolverStep, stepsLeft: number }  // the next operation, and how many are left counting it
    | { kind: 'done' }                                        // the best value is already on the board
    | { kind: 'unreachable' };                                // the numbers on the board can not reach it any more

// The next operation towards the best value, from the numbers that are on the board now.
export function nextHint(values: Array<number>, target: number, best: number, date: Date): NextHint {
    const { value, solutions } = solveCifras(values, target);
    if (value !== best) return { kind: 'unreachable' };

    const solution = chooseSolution(solutions, date);
    if (solution === null || solution.length === 0) return { kind: 'done' };

    return { kind: 'step', step: solution[0], stepsLeft: solution.length };
}