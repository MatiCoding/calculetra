import type { Tile, TreeNode } from '../../domain/cifras/typesCifras';
import styles from './SolutionTree.module.css';

type Props = {
    trees: Array<TreeNode>;
    onUndo: (resultId: number) => void;
    // The free number the starting numbers of the tree can be swapped for.
    swapTile: Tile | null;
    onSwap: (oldTileId: number) => void;
    overId: number | null;
    freshId: number | null; // The newest result, which grows into the tree.
    changedIds: Array<number>;  // The tiles that changed in the last swap, which flash.
    shake: boolean; // True after a swap that did not word, so the tree shakes.
    disabled: boolean;
};

function SolutionTree({ trees, shake, ...nodeProps }: Props) {
    return (
        <section aria-labelledby="solution-tree-title" className={styles.box}>
            <h3 id="solution-tree-title" className={styles.title}>Cómo has llegado</h3>
            <p className={styles.description}>
                Pulsa un resultado para deshacer esa rama. Arrastra un número libre encima de otro del árbol
                para cambiarlo y se recalcula todo lo que cuelga de él.
            </p>
            {trees.length === 0 ? (
                <p className={styles.empty}>Aún no has hecho ninguna operación.</p>
            ) : (
                <ul aria-label="Cómo has llegado" className={`${styles.trees} ${shake ? styles.shake : ''}`}>
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

type NodeProps = Omit<Props, 'trees' | 'shake'> & { node: TreeNode };

// Draws a node and, if it is a result, the two numbers it hangs from.
function Node(props: NodeProps) {
    const { node, onUndo, swapTile, onSwap, overId, freshId, changedIds, disabled } = props;
    const changed = changedIds.includes(node.tile.id) ? styles.changed : '';

    if (node.kind === 'leaf') {
        if (swapTile === null) {
            return <span className={`${styles.leaf} ${changed}`}>{node.tile.value}</span>;
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
        <div role="group" aria-label={label} className={`${styles.node} ${node.tile.id === freshId ? styles.fresh : ''}`}>
            <button
                type="button"
                aria-label={`Deshacer ${label}`}
                onClick={() => onUndo(node.tile.id)}
                disabled={disabled}
                className={`${styles.result} ${changed}`}
            >
                {node.tile.value}
            </button>
            <div className={styles.children}>
                <div className={styles.branch}>
                    <Node {...props} node={node.left} onUndo={onUndo} swapTile={swapTile} onSwap={onSwap} overId={overId} disabled={disabled} />
                </div>
                <span className={styles.operator} aria-hidden="true">{node.operator}</span>
                <div className={styles.branch}>
                    <Node {...props} node={node.right} onUndo={onUndo} swapTile={swapTile} onSwap={onSwap} overId={overId} disabled={disabled} />
                </div>
            </div>
        </div>
    );
}

export default SolutionTree;