import { describe, expect, it } from 'vitest';
import { applyOperation } from './operation';

describe('applyOperation', () => {
  it('adds', () => {
    expect(applyOperation(2, '+', 3)).toEqual({ ok: true, value: 5 });
  });

  it('subtracts', () => {
    expect(applyOperation(7, '-', 3)).toEqual({ ok: true, value: 4 });
  });

  it('multiplies', () => {
    expect(applyOperation(4, '×', 5)).toEqual({ ok: true, value: 20 });
  });

  it('divides', () => {
    expect(applyOperation(20, '÷', 4)).toEqual({ ok: true, value: 5 });
  });

  it('rejects a subtraction with a negative result', () => {
    expect(applyOperation(3, '-', 7)).toEqual({
      ok: false,
      reason: 'not-positive',
    });
  });

  it('rejects a subtraction with a result of 0', () => {
    expect(applyOperation(5, '-', 5)).toEqual({
      ok: false,
      reason: 'not-positive',
    });
  });

  it('rejects a division that is not exact', () => {
    expect(applyOperation(7, '÷', 2)).toEqual({
      ok: false,
      reason: 'not-exact',
    });
  });

  it('keeps the order of the numbers', () => {
    expect(applyOperation(100, '÷', 4)).toEqual({ ok: true, value: 25 });
    expect(applyOperation(4, '÷', 100)).toEqual({
      ok: false,
      reason: 'not-exact',
    });
  });
});
