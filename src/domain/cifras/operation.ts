import type { Operator, OperationResult } from './typesCifras';

export function applyOperation(a: number, operator: Operator, b: number): OperationResult {
    switch (operator) {
        case '+':
            return { ok: true, value: a + b };
        case '-':
            if (a - b <= 0) {
                return { ok: false, reason: 'not-positive' };
            }
            return { ok: true, value: a - b };
        case '×':
            return { ok: true, value: a * b };
        case '÷':
            if (a % b !== 0) {
                return { ok: false, reason: 'not-exact' };
            }
            return { ok: true, value: a / b };
        default: {
            const unexpected: never = operator;
            throw new Error(`Unknown operator: ${unexpected}`);
        }
    }
}