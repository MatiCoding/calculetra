import type {Step, Tile, TreeNode} from './typesCifras'

export function buildTree(steps: Array<Step>): Array<TreeNode> {
    const stepByResultId = new Map(steps.map((step) => [step.result.id, step]));
    const usedIds = new Set(steps.flatMap((step) => [step.left.id, step.right.id]));

    function nodeOf(tile: Tile): TreeNode {
        const step = stepByResultId.get(tile.id);
        if (step === undefined) {
            return {kind: 'leaf', tile};
        }
        return {
            kind: 'step',
            tile,
            operator: step.operator,
            left: nodeOf(step.left),
            right: nodeOf(step.right),
        };
    }

    return steps
        .filter((step) => !usedIds.has(step.result.id))
        .map((step) => nodeOf(step.result));
}