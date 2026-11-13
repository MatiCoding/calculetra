import { applyOperation } from './operation';
import type { Operator } from './typesCifras';

export type SolverStep = { left: number, operator: Operator, right: number, result: number };

// The best result of a challenge and every shortest way to reach it.
export type SolverResult = { value: number, solutions: Array<Array<SolverStep>> };

const OPERATORS: Array<Operator> = ['+', '-', '×', '÷'];

function distance(value: number, target: number): number {
    return Math.abs(value - target);
}

// The same rule as getBestValue: closer to the target, and the smaller one on a tie.
function isBetter(value: number, best: number, target: number): boolean {
    const gap = distance(value, target);
    const bestGap = distance(best, target);
    return gap < bestGap || (gap === bestGap && value < best);
}

// Every operation that can be done with two of the numbers, following the game rules,
// with the numbers that are left after it (the two used ones go, the result comes in).
function possibleSteps(numbers: Array<number>): Array<{ step: SolverStep, rest: Array<number> }> {
    const moves: Array<{ step: SolverStep, rest: Array<number> }> = [];

    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            // The bigger one goes first: a + b is the same as b + a, and b - a or b ÷ a would not be valid.
            const left = Math.max(numbers[i], numbers[j]);
            const right = Math.min(numbers[i], numbers[j]);
            const others = numbers.filter((_, index) => index !== i && index !== j);

            for (const operator of OPERATORS) {
                // Multiplying or dividing by 1 gives the same number: a step that does nothing.
                if ((operator === '×' || operator === '÷') && right === 1) continue;

                const result = applyOperation(left, operator, right);
                if (!result.ok) continue;

                moves.push({
                    step: { left, operator, right, result: result.value },
                    rest: [...others, result.value],
                });
            }
        }
    }
    return moves;
}

export function solveCifras(numbers: Array<number>, target: number): SolverResult {
    // 1st pass: the best value that can be reached, and the fewest steps to reach it.
    let best = numbers[0];
    let fewestSteps = 0;

    function explore(current: Array<number>, depth: number): void {
        for (const value of current) {
            if (isBetter(value, best, target) || (value === best && depth < fewestSteps)) {
                best = value;
                fewestSteps = depth;
            }
        }
        // Once the target is reached, a longer way can not be better.
        if (best === target && depth >= fewestSteps) return;

        for (const { rest } of possibleSteps(current)) {
            explore(rest, depth + 1);
        }
    }
    explore(numbers, 0);

    // 2nd pass: every way to reach the best value with exactly that number of steps.
    const solutions: Array<Array<SolverStep>> = [];

    function collect(current: Array<number>, path: Array<SolverStep>): void {
        if (path.length === fewestSteps) {
            const last = path.at(-1);
            if (last === undefined || last.result === best) solutions.push(path);
            return;
        }
        for (const { step, rest } of possibleSteps(current)) {
            collect(rest, [...path, step]);
        }
    }
    collect(numbers, []);

    return { value: best, solutions };
}