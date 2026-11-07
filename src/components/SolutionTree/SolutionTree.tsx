import type { Tile, TreeNode } from '../../domain/cifras/typesCifras';
import styles from './SolutionTree.module.css';

type Props = {
    trees: Array<TreeNode>;
    onUndo: (resultId: number) => void;
    // The free number the starting numbers of the tree can be swapped for.
    swapTile: Tile | null;
    onSwap: (oldTileId: number) => void;
    overId: number | null;
    disabled: boolean;
};

function SolutionTree({ trees, ...nodeProps }: Props) {
    return (
        <section aria-labelledby="solution-tree-title" className={styles.box}>
            <h3 id="solution-tree-title" className={styles.title}>Cómo has llegado</h3>
            {trees.length === 0 ? (
                <p className={styles.empty}>Aquí verás de dónde sale cada número que calcules.</p>
            ) : (
                <ul aria-label="Cómo has llegado" className={styles.trees}>
                    {trees.map((tree) => (
                        <li key={tree.tile.id}>
                            <Node node={tree} {...nodeProps} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

type NodeProps = Omit<Props, 'trees'> & { node: TreeNode };

// Draws a node and, if it is a result, the two numbers it hangs from.
function Node({ node, onUndo, swapTile, onSwap, disabled, overId }: NodeProps) {
    if (node.kind === 'leaf') {
        if (swapTile === null) {
            return <span className={styles.leaf}>{node.tile.value}</span>;
        }
        return (
            <button
                type="button"
                aria-label={`Cambiar ${node.tile.value} por ${swapTile.value}`}
                onClick={() => onSwap(node.tile.id)}
                data-leaf={node.tile.id}
                className={`${styles.leaf} ${styles.swappable} ${overId === node.tile.id ? styles.over : ''}`}
            >
                {node.tile.value}
            </button>
        );
    }

    const label = `${node.left.tile.value} ${node.operator} ${node.right.tile.value} = ${node.tile.value}`;
    return (
        <div role="group" aria-label={label} className={styles.node}>
            <button
                type="button"
                aria-label={`Deshacer ${label}`}
                onClick={() => onUndo(node.tile.id)}
                disabled={disabled}
                className={styles.result}
            >
                {node.tile.value}
            </button>
            <div className={styles.children}>
                <div className={styles.branch}>
                    <Node node={node.left} onUndo={onUndo} swapTile={swapTile} onSwap={onSwap} overId={overId} disabled={disabled} />
                </div>
                <span className={styles.operator} aria-hidden="true">{node.operator}</span>
                <div className={styles.branch}>
                    <Node node={node.right} onUndo={onUndo} swapTile={swapTile} onSwap={onSwap} overId={overId} disabled={disabled} />
                </div>
            </div>
        </div>
    );
}

export default SolutionTree;