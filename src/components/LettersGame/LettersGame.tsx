import { useReducer, useEffect, useState } from 'react';
import { getDailyLetters } from '../../domain/letras/challengeLetras';
import { gameReducer, getWord, initialState, isPicked } from '../../domain/letras/gameLetras';
import { loadDictionary } from '../../domain/letras/dictionaryLetras';
import { canSubmit } from '../../domain/letras/wordLetras';

type Props = {
    loadWords ?: () => Promise<Set<string>>;
}

function LettersGame({loadWords = loadDictionary}: Props) {
    const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState(getDailyLetters(new Date())));
    const [dictionary, setDictionary] = useState<Set<string> | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        let ignore = false;
        loadWords().then((words) => {
            if (!ignore) setDictionary(words);
        }).catch(() => {
            if (!ignore) setLoadFailed(true);
        });
        return () => {
            ignore = true;
        };
    }, [loadWords]);

    const word = getWord(state);
    const letters = state.tiles.map((tile) => tile.letter);
    const finished = state.result !== null;

    function submit() {
        if (dictionary !== null) dispatch({type: 'submit', dictionary});
    }

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
                <button onClick={submit} disabled={dictionary === null || !canSubmit(word, letters) || finished}>
                    Enviar
                </button>
            </div>

            {dictionary === null && !loadFailed && <p>Cargando diccionario...</p>}
            {loadFailed && (
                <p role="alert">No se ha podido cargar el diccionario. Recarga la página para jugar.</p>
            )}

            {state.result !== null && (
                <section aria-label="Resultado">
                    <dl>
                        <dt>Palabras</dt>
                        <dd>{state.result.word}</dd>
                        <dt>¿Vale?</dt>
                        <dd>{state.result.isValid ? 'Sí, está en el diccionario' : 'No está en el diccionario'}</dd>
                        <dt>Letras</dt>
                        <dd>{state.result.word.length}</dd>
                        <dt>Puntos</dt>
                        <dd>{state.result.score}</dd>
                    </dl>
                </section>
            )}

        </div>
    );
}

export default LettersGame;
