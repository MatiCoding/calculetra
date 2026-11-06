import { describe, expect, it } from 'vitest';
import { gameReducer, initialState } from './gameCifras';
import { buildTree } from './treeCifras';
import type { Challenge, GameState, Operator, TreeNode } from './typesCifras';

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

// Writes a tree as text, so the tests are easy to read: (100 × 3 = 300).
function show(node: TreeNode): string {
  if (node.kind === 'leaf') {
    return String(node.tile.value);
  }
  return `(${show(node.left)} ${node.operator} ${show(node.right)} = ${node.tile.value})`;
}

describe('buildTree', () => {
  it('has no trees when there are no steps', () => {
    expect(buildTree([])).toEqual([]);
  });

  it('hangs a result from the two numbers used, with the operator', () => {
    const state = play(initialState(challenge), 100, '×', 3);

    expect(buildTree(state.steps).map(show)).toEqual(['(100 × 3 = 300)']);
  });

  it('keeps the tiles, so the tree knows their ids', () => {
    const state = play(initialState(challenge), 100, '×', 3);
    const [tree] = buildTree(state.steps);

    expect(tree).toEqual({
      kind: 'step',
      tile: state.steps[0].result,
      operator: '×',
      left: { kind: 'leaf', tile: state.steps[0].left },
      right: { kind: 'leaf', tile: state.steps[0].right },
    });
  });

  it('puts a result used again inside the tree of the new result', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const second = play(first, 300, '+', 25);

    expect(buildTree(second.steps).map(show)).toEqual(['((100 × 3 = 300) + 25 = 325)']);
  });

  it('can have results on both sides', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const second = play(first, 50, '+', 8);
    const third = play(second, 300, '-', 58);

    expect(buildTree(third.steps).map(show)).toEqual(['((100 × 3 = 300) - (50 + 8 = 58) = 242)']);
  });

  it('makes one tree for each result not used again, in the order they were made', () => {
    const first = play(initialState(challenge), 100, '×', 3);
    const second = play(first, 50, '+', 8);

    expect(buildTree(second.steps).map(show)).toEqual(['(100 × 3 = 300)', '(50 + 8 = 58)']);
  });

  it('works with repeated numbers', () => {
    const start = initialState({ numbers: [5, 5, 1, 1, 25, 100], target: 500 });
    // idOf would find the first 5 twice, so the two 5s are chosen by id.
    const withFirst = gameReducer(start, { type: 'selectTile', id: 0 });
    const withOperator = gameReducer(withFirst, { type: 'selectOperator', operator: '+' });
    const first = gameReducer(withOperator, { type: 'selectTile', id: 1 });
    const second = play(first, 10, '×', 25);
    const [tree] = buildTree(second.steps);

    expect(show(tree)).toBe('((5 + 5 = 10) × 25 = 250)');
    // Each 5 is a different leaf, with its own id.
    if (tree.kind === 'step' && tree.left.kind === 'step') {
      expect(tree.left.left.tile.id).not.toBe(tree.left.right.tile.id);
    }
  });
});
