import { useReducer } from 'react';
import { getDailyChallenge } from '../../domain/cifras/challenge';
import { gameReducer, initialState } from '../../domain/cifras/game';
import {calculateScore, getBestValue} from '../../domain/cifras/score';
import type { OperationError, Operator } from '../../domain/cifras/types';
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

function NumbersGame() {
    const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState(getDailyChallenge(new Date())));
    const bestValue = getBestValue(state);

    return (
        <div className={styles.container}>
            <h2 className={styles.target}>Objetivo: {state.challenge.target}</h2>
            <h3>Números disponibles:</h3>
            <ul aria-label="Números" className={styles.numbersUl}>
                {state.tiles.map((tile) => (
                    <li key={tile.id} className = {styles.tileItem}>
                        <button
                            aria-pressed={tile.id === state.selectedId}
                            onClick={() => dispatch({ type: 'selectTile', id: tile.id })}
                            disabled={state.finished}
                            className={styles.tile}
                        >
                            {tile.value}
                        </button>
                    </li>
                ))}
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
            {state.error !== null && <p role="alert" className={styles.error}>
                {ERROR_MESSAGES[state.error]}
            </p>}

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

            <ol aria-label="Pasos" className={styles.steps}>
                {state.steps.map((step) => (
                    <li key={step.result.id}>
                        {step.left.value} {step.operator} {step.right.value} = {step.result.value}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default NumbersGame