import { useReducer } from 'react';
import { getDailyChallenge } from '../../domain/cifras/challenge';
import { gameReducer, initialState } from '../../domain/cifras/game';
import type { Operator } from '../../domain/cifras/types';
import styles from './NumbersGame.module.css';

const OPERATORS: Array<{ operator: Operator; label: string }> = [
    { operator: '+', label: 'Sumar' },
    { operator: '-', label: 'Restar' },
    { operator: '×', label: 'Multiplicar' },
    { operator: '÷', label: 'Dividir' },
];

function NumbersGame() {
    const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState(getDailyChallenge(new Date())));

    return (
        <div>
            <h2 className={styles.target}>Objetivo: {state.challenge.target}</h2>
            <h3>Números disponibles:</h3>
            <ul aria-label="Números" className={styles.numbersUl}>
                {state.tiles.map((tile) => (
                    <li key={tile.id} className={styles.numbersLi}>
                        <button
                            aria-pressed={tile.id === state.selectedId}
                            onClick={() => dispatch({ type: 'selectTile', id: tile.id })}
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
                    >
                        {operator}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default NumbersGame