import type { TreeNode } from '../../domain/cifras/typesCifras';
import styles from './SolutionTree.module.css';

type Props = {
    trees: Array<TreeNode>;
};

function SolutionTree({ trees }: Props) {
    return (
        <section aria-labelledby="solution-tree-title" className={styles.box}>
            <h3 id="solution-tree-title" className={styles.title}>Cómo has llegado</h3>
            {trees.length === 0 ? (
                <p className={styles.empty}>Aquí verás de dónde sale cada número que calcules.</p>
            ) : (
                <ul aria-label="Cómo has llegado" className={styles.trees}>
                    {trees.map((tree) => (
                        <li key={tree.tile.id}>
                            <Node node={tree} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

// Draws a node and, if it is a result, the two numbers it hangs from.
function Node({ node }: { node: TreeNode }) {
    if (node.kind === 'leaf') {
        return <span className={styles.leaf}>{node.tile.value}</span>;
    }

    const label = `${node.left.tile.value} ${node.operator} ${node.right.tile.value} = ${node.tile.value}`;
    return (
        <div role="group" aria-label={label} className={styles.node}>
            <span className={styles.result}>{node.tile.value}</span>
            <div className={styles.children}>
                <Node node={node.left} />
                <span className={styles.operator} aria-hidden="true">{node.operator}</span>
                <Node node={node.right} />
            </div>
        </div>
    );
}

export default SolutionTree;