import { useLayoutEffect, useReducer, useRef, useState } from 'react';
import { getChallengeNumber, getDailyChallenge } from '../../domain/cifras/challengeCifras';
import { gameReducer, initialState } from '../../domain/cifras/gameCifras';
import {calculateScore, getBestValue} from '../../domain/cifras/scoreCifras';
import type { OperationError, Operator, GameState, Tile } from '../../domain/cifras/typesCifras';
import { previewKind, previewOperation } from '../../domain/cifras/previewCifras';
import { buildTree } from '../../domain/cifras/treeCifras';
import { canDragToTree, swapCandidate } from '../../domain/cifras/substituteCifras';
import { useDragToSwap } from './useDragToSwap';
import SolutionTree from '../SolutionTree/SolutionTree';
import styles from './NumbersGame.module.css';

const OPERATORS: Array<{ operator: Operator; label: string; symbol: string }> = [
    { operator: '+', label: 'Sumar', symbol: '+' },
    { operator: '-', label: 'Restar', symbol: '−' },
    { operator: '×', label: 'Multiplicar', symbol: '×' },
    { operator: '÷', label: 'Dividir', symbol: '÷' },
];

const ERROR_MESSAGES: Record<OperationError, string> = {
    'not-positive': 'El resultado tiene que ser mayor que 0.',
    'not-exact': 'La división tiene que ser exacta.',
};

// What the player can do now, shown under the target.
function hintText(state: GameState, swapTile: Tile | null): string {
    if (state.finished) {
        return '';
    }
    const selected = state.tiles.find((tile) => tile.id === state.selectedId);
    if (selected === undefined) {
        return 'Elige un número.';
    }
    if (state.operator !== null) {
        return 'Encima de cada número ves lo que daría. Toca uno.';
    }
    if (swapTile !== null) {
        return `Elige qué hacer con ${selected.value}, o toca un número del árbol para cambiarlo por ${selected.value}.`;
    }
    return `Elige qué hacer con ${selected.value}.`;
}

// The message of the last mistake, if there is one.
function errorText(state: GameState): string | null {
    if (state.substituteError !== null) {
        const { value, reason } = state.substituteError;
        return `Con ${value} no sale: ${ERROR_MESSAGES[reason].toLowerCase()}`;
    }
    return state.error === null ? null : ERROR_MESSAGES[state.error];
}

// How long the entrance from the home page lasts: the orange shrinks and then the tiles fly to their place.
const INTRO_MS = 1500;

type Props = {
    intro?: boolean;
};

function NumbersGame({ intro = false }: Props) {
    const [playingIntro, setPlayingIntro] = useState(intro);
    const boardRef = useRef<HTMLUListElement>(null);

    // Before the first paint, every tile learns how far it is from the centre of the screen,
    // so the animation can start there and fly to its place.
    useLayoutEffect(() => {
        if (!playingIntro) return;
        const tiles = boardRef.current?.querySelectorAll('button') ?? [];
        tiles.forEach((tile, index) => {
            const rect = tile.getBoundingClientRect();
            tile.style.setProperty('--from-x', `${window.innerWidth / 2 - (rect.left + rect.width / 2)}px`);
            tile.style.setProperty('--from-y', `${window.innerHeight / 2 - (rect.top + rect.height / 2)}px`);
            tile.style.setProperty('--delay', `${index * 30}ms`);
        });
        const timer = setTimeout(() => setPlayingIntro(false), INTRO_MS);
        return () => {
            clearTimeout(timer);
            tiles.forEach((tile) => {
                tile.style.removeProperty('--from-x');
                tile.style.removeProperty('--from-y');
            });
        };
    }, [playingIntro]);
    const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState(getDailyChallenge(new Date())));
    const bestValue = getBestValue(state);
    const swapTile = swapCandidate(state);
    const error = errorText(state);
    const { drag, startPress, wasDragged } = useDragToSwap((oldTileId, newTileId) =>
        dispatch({ type: 'substitute', oldTileId, newTileId }),
    );

    return (
        <div className={`${styles.container} ${playingIntro ? styles.intro : ''}`}>
    {playingIntro && <div className={styles.cover} data-testid="intro-cover" aria-hidden="true" />}
            <div className={styles.top}>
                <p className={styles.eyebrow}>Reto nº {getChallengeNumber(new Date())} · objetivo</p>
                <h2 className={styles.target} aria-label={`Objetivo: ${state.challenge.target}`}>
                    {state.challenge.target}
                </h2>
                <p role="status" className={styles.hint}>{hintText(state, swapTile)}</p>
                <ul aria-label="Números" className={styles.numbersUl}>
                    {state.tiles.map((tile) => {
                        const preview = previewOperation(state, tile.id);
                        return (
                            <li key={tile.id} className={styles.tileItem}>
                                {preview !== null && (
                                    <span className={styles.preview} data-kind={previewKind(preview, state.challenge.target)}>
                                        {preview.ok ? `= ${preview.value}` : 'no vale'}
                                    </span>
                                )}
                                <button
                                    aria-pressed={tile.id === state.selectedId}
                                    onPointerDown={(event) => {
                                        if (canDragToTree(state, tile.id)) {
                                            startPress(event, tile);
                                        }
                                    }}
                                    onClick={() => {
                                        if (!wasDragged()) {
                                            dispatch({ type: 'selectTile', id: tile.id });
                                        }
                                    }}
                                    disabled={state.finished}
                                    className={`${styles.tile} ${tile.id >= state.challenge.numbers.length ? styles.calculated : ''} ${drag?.tile.id === tile.id ? styles.dragging : ''}`}
                                >
                                    {tile.value}
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <div role="group" aria-label="Operaciones" className={styles.operators}>
                    {OPERATORS.map(({ operator, label, symbol }) => (
                        <button
                            key={operator}
                            aria-label={label}
                            aria-pressed={operator === state.operator}
                            onClick={() => dispatch({ type: 'selectOperator', operator })}
                            disabled={state.finished}
                            className={styles.operatorButton}
                        >
                            {symbol}
                        </button>
                    ))}
                </div>
                <p role="alert" className={styles.error}>{error}</p>
            </div>

            <SolutionTree
                trees={buildTree(state.steps)}
                onUndo={(resultId) => dispatch({ type: 'undoTo', resultId })}
                swapTile={drag?.tile ?? swapTile}
                overId={drag?.overId ?? null}
                freshId={state.steps.at(-1)?.result.id ?? null}
                changedIds={state.changedIds}
                shake={state.substituteError !== null}                
                onSwap={(oldTileId) => {
                    if (swapTile !== null) {
                        dispatch({ type: 'substitute', oldTileId, newTileId: swapTile.id });
                    }
                }}                
                disabled={state.finished}
            />
            
            {drag !== null && (
                <span
                    aria-hidden="true"
                    className={`${styles.tile} ${styles.ghost}`}
                    style={{ left: drag.x - drag.offsetX, top: drag.y - drag.offsetY }}
                >
                    {drag.tile.value}
                </span>
            )}            
            
            <div className={styles.bottom}>
                <div className={styles.actions}>
                    <button onClick={() => dispatch({ type: 'undo' })} disabled={state.steps.length === 0 || state.finished} className={styles.secondary}>
                        Deshacer
                    </button>
                    <button onClick={() => dispatch({ type: 'finish' })} disabled={state.finished} className={styles.primary}>
                        Terminar
                    </button>
                    <button onClick={() => dispatch({ type: 'reset' })} className={styles.secondary}>
                        Reiniciar
                    </button>
                </div>

                {state.finished && (
                    <section aria-label="Resultado" className={styles.result}>
                        <dl>
                            <dt>Puntos</dt>
                            <dd className={styles.score}>{calculateScore(state.challenge.target, bestValue)}</dd>
                            <dt>Mejor número</dt>
                            <dd>{bestValue}</dd>
                            <dt>Distancia</dt>
                            <dd>{Math.abs(bestValue - state.challenge.target)}</dd>
                        </dl>
                    </section>
                )}
            </div>
        </div>
    );
}

export default NumbersGame