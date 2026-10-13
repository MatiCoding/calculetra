export type Challenge = { numbers: Array<number>, target : number};
export type Operator = '+' | '-' | '×' | '÷';
export type OperationResult = { ok: true, value: number } | { ok: false, reason: 'not-positive' | 'not-exact' };