import { useReducer } from 'react';
import { getDailyLetters } from '../../domain/letras/challengeLetras';
import { gameReducer, getWord, initialState, isPicked } from '../../domain/letras/gameLetras';

function LettersGame() {
    const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState(getDailyLetters(new Date())));
    const word = getWord(state);
    const finished = state.result !== null;

    return (
        <div>
            <h2>Forma la palabra más larga</h2>

            <output aria-label="Tu palabra">{word}</output>

            <ul aria-label="Letras">
                {state.tiles.map((tile) => (
                    <li key={tile.id}>
                        <button
                            onClick={() => dispatch({ type: 'pick', id: tile.id })}
                            disabled={isPicked(state, tile.id) || finished}
                        >
                            {tile.letter}
                        </button>
                    </li>
                ))}
            </ul>

            <div>
                <button onClick={() => dispatch({ type: 'removeLast' })} disabled={word === '' || finished}>
                    Borrar letra
                </button>
                <button onClick={() => dispatch({ type: 'clear' })} disabled={word === '' || finished}>
                    Borrar todo
                </button>
            </div>
        </div>
    );
}

export default LettersGame;
