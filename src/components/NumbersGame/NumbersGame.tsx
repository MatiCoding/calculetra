import { useReducer } from 'react';
import { getDailyChallenge } from '../../domain/cifras/challenge';
import { gameReducer, initialState } from '../../domain/cifras/game';
import {calculateScore, getBestValue} from '../../domain/cifras/score';
import type { OperationError, Operator } from '../../domain/cifras/types';
import styles from './NumbersGame.module.css';

const OPERATORS: Array<{ operator: Operator; label: string }> = [
    { operator: '+', label: 'Sumar' },
    { operator: '-', label: 'Restar' },
    { operator: '×', label: 'Multiplicar' },
    { operator: '÷', label: 'Dividir' },
];

const ERROR_MESSAGES: Record<OperationError, string> = {
    'not-positive': 'El resultado tiene que ser mayor que 0.',
    'not-exact': 'La división tiene que ser exacta.',
};

function NumbersGame() {
    const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState(getDailyChallenge(new Date())));
    const bestValue = getBestValue(state);

    return (
        <div>
            <h2 className={styles.target}>Objetivo: {state.challenge.target}</h2>
            <ol aria-label="Pasos">
                {state.steps.map((step) => (
                    <li key={step.result.id}>
                        {step.left.value} {step.operator} {step.right.value} = {step.result.value}
                    </li>
                ))}
            </ol>
            <h3>Números disponibles:</h3>
            <ul aria-label="Números" className={styles.numbersUl}>
                {state.tiles.map((tile) => (
                    <li key={tile.id} className={styles.numbersLi}>
                        <button
                            aria-pressed={tile.id === state.selectedId}
                            onClick={() => dispatch({ type: 'selectTile', id: tile.id })}
                            disabled={state.finished}
                        >
                            {tile.value}
                        </button>
                    </li>
                ))}
            </ul>
            <div role="group" aria-label="Operaciones">
                {OPERATORS.map(({ operator, label }) => (
                    <button
                        key={operator}
                        aria-label={label}
                        aria-pressed={operator === state.operator}
                        onClick={() => dispatch({ type: 'selectOperator', operator })}
                        disabled={state.finished}
                    >
                        {operator}
                    </button>
                ))}
            </div>
            {state.error !== null && <p role="alert">{ERROR_MESSAGES[state.error]}</p>}
            <button onClick={() => dispatch({ type: 'undo' })} disabled={state.steps.length === 0 || state.finished}>
                Deshacer
            </button>
            <button onClick={() => dispatch({ type: 'finish' })} disabled={state.finished}>
                Terminar
            </button>
            <button onClick={() => dispatch({ type: 'reset' })}>Reiniciar</button>

            <div>
                {state.finished && (
                    <div>
                        <div>Mejor número: {bestValue}</div>
                        <div>Distancia: {Math.abs(bestValue- state.challenge.target)}</div>
                        <div>Puntos: {calculateScore(state.challenge.target, bestValue)}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NumbersGame