import { useEffect, useReducer, useState } from 'react';
import { getDailyLetters } from '../../domain/letras/challengeLetras';
import { loadDictionary } from '../../domain/letras/dictionaryLetras';
import { gameReducer, getWord, initialState, isPicked } from '../../domain/letras/gameLetras';
import { canSubmit } from '../../domain/letras/wordLetras';
import styles from './LettersGame.module.css';

type Props = {
    loadWords?: () => Promise<Set<string>>;
};

function LettersGame({ loadWords = loadDictionary }: Props) {
    const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState(getDailyLetters(new Date())));
    const [dictionary, setDictionary] = useState<Set<string> | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        let ignore = false;
        loadWords()
            .then((words) => {
                if (!ignore) setDictionary(words);
            })
            .catch(() => {
                if (!ignore) setLoadFailed(true);
            });
        return () => {
            ignore = true;
        };
    }, [loadWords]);

    // Physical keyboard:.
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.ctrlKey || event.metaKey || event.altKey) return;

            if (event.key === 'Backspace') {
                event.preventDefault();
                dispatch({ type: 'removeLast' });
            } else if (event.key === 'Enter') {
                // On a focused button, Enter already clicks it.
                if (event.target instanceof HTMLButtonElement) return;
                if (dictionary !== null) dispatch({ type: 'submit', dictionary });
            } else if (event.key.length === 1) {
                dispatch({ type: 'type', letter: event.key });
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dictionary]);

    const word = getWord(state);
    const letters = state.tiles.map((tile) => tile.letter);
    const finished = state.result !== null;

    function submit() {
        if (dictionary !== null) dispatch({ type: 'submit', dictionary });
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Forma la palabra más larga</h2>

            <output aria-label="Tu palabra" className={styles.word}>{word}</output>

            <ul aria-label="Letras" className={styles.letters}>
                {state.tiles.map((tile) => (
                    <li key={tile.id}>
                        <button
                            onClick={() => dispatch({ type: 'pick', id: tile.id })}
                            disabled={isPicked(state, tile.id) || finished}
                            data-used={isPicked(state, tile.id)}
                            className={styles.tile}
                        >
                            {tile.letter}
                        </button>
                    </li>
                ))}
            </ul>

            <div className={styles.actions}>
                <button onClick={() => dispatch({ type: 'removeLast' })} disabled={word === '' || finished} className={styles.secondary}>
                    Borrar letra
                </button>
                <button onClick={() => dispatch({ type: 'clear' })} disabled={word === '' || finished} className={styles.secondary}>
                    Borrar todo
                </button>
                <button onClick={submit} disabled={dictionary === null || !canSubmit(word, letters) || finished} className={styles.primary}>
                    Enviar
                </button>
            </div>

            {dictionary === null && !loadFailed && <p className={styles.status}>Cargando diccionario...</p>}
            {loadFailed && (
                <p role="alert" className={styles.error}>No se ha podido cargar el diccionario. Recarga la página para jugar.</p>
            )}

            {state.result !== null && (
                <section aria-label="Resultado" className={styles.result}>
                    <dl>
                        <dt>Palabra</dt>
                        <dd>{state.result.word}</dd>
                        <dt>¿Vale?</dt>
                        <dd>{state.result.isValid ? 'Sí, está en el diccionario' : 'No está en el diccionario'}</dd>
                        <dt>Letras</dt>
                        <dd>{state.result.word.length}</dd>
                        <dt>Puntos</dt>
                        <dd className={styles.score}>{state.result.score}</dd>
                    </dl>
                </section>
            )}
        </div>
    );
}

export default LettersGame;
