import { useEffect, useReducer, useState, type CSSProperties } from 'react';
import { getDailyLetters } from '../../domain/letras/challengeLetras';
import { loadDictionary } from '../../domain/letras/dictionaryLetras';
import { gameReducer, getWord, initialState, isPicked } from '../../domain/letras/gameLetras';
import { canSubmit } from '../../domain/letras/wordLetras';
import styles from './LettersGame.module.css';

const SLOTS = 9;
const MIN_LETTERS = 3;

const HOP_STEP = 150;  // Time between one tile's hop and the next ones, in ms.
const HOP_END = 700;    // Extra time after the last hop before the result appears, in ms.

// The day's letters spin like slot-machine reels: all start together and stop left to right.
const SPIN_BASE = 650;  // How long the first reel spins, in ms.
const SPIN_STEP = 190;  // How much longer each next reel spins, in ms.
const REEL_ALPHABET = 'ABCDEFGHIJLMNÑOPQRSTUVXYZ';  // Same letters as the Letter's bag (no K and W).

type BoardStatus = 'playing' | 'valid' | 'full' | 'invalid';

function prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

// Puts the index of each tile into the CSS variable --i, for animation-delay.
function delayStyle(index:number): CSSProperties {
    return { '--i': index } as CSSProperties;
}

// How long the reel of the key at this position spins.
function spinTime(index: number): number {
    return SPIN_BASE + index * SPIN_STEP;
}

// The letters that pass through a key while it spins: random ones, and the real one at the end.
function createReel(letter: string, index: number): Array<string> {
    const length = 9 + index * 5;
    const random = Array.from({length}, () => REEL_ALPHABET[Math.floor(Math.random()*REEL_ALPHABET.length)]);
    return [...random, letter];
}

// Gives the CSS the length of the reel (--n) and how long it spins (--t).
function reelStyle(reel: Array<string>, index: number) : CSSProperties {
    return {'--n': reel.length, '--t': `${spinTime(index)}ms`} as CSSProperties;
}

type Props = {
    loadWords?: () => Promise<Set<string>>;
};

function LettersGame({ loadWords = loadDictionary }: Props) {
    const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState(getDailyLetters(new Date())));
    const [dictionary, setDictionary] = useState<Set<string> | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);

    const[reels] = useState(() => state.tiles.map((tile, index) => createReel(tile.letter, index)));
    const [landed, setLanded] = useState(() => (prefersReducedMotion() ? state.tiles.length : 0));  // How many keys have stopped spinning. They stop from left to right.
    const spinning = landed < state.tiles.length;

    // Stops the reels one by one.
    useEffect(() => {
        if (prefersReducedMotion()) return;
        const timers = reels.map((_, index) => setTimeout(() => setLanded(index + 1), spinTime(index)));
        return () => timers.forEach(clearTimeout);
    }, [reels]);


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
            if (spinning || event.ctrlKey || event.metaKey || event.altKey) return;

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

    const [revealed, setRevealed] = useState(false);
    const [points, setPoints] = useState(0);
    const result = state.result;

    // Shows the result sectoin once the tiles have finished hopping.
    useEffect(() => {
        if (result === null) return;
        const delay = prefersReducedMotion() ? 0 : HOP_STEP * result.word.length + HOP_END;
        const timer = setTimeout(() => setRevealed(true), delay);
        return () => clearTimeout(timer);
    }, [result]);

    // Counts the points up, one by one.
    useEffect(() => {
        if (result === null || !result.isValid || prefersReducedMotion()) return;
        const score = result.score;
        const step = score === 18 ? HOP_STEP / 2 : HOP_STEP;
        let count = 0;
        const timer = setInterval(() => {
            count += 1;
            setPoints(count);
            if (count === score) clearInterval(timer);
        }, step);
        return () => clearInterval(timer);
    }, [result]);

    const word = getWord(state);
    const letters = state.tiles.map((tile) => tile.letter);
    const finished = result !== null;
    const slots = Array.from({length: SLOTS }, (_, index) => word[index]);

    let status: BoardStatus = 'playing';
    if (result !== null) {
        if (!result.isValid) status = 'invalid';
        else if (result.score === 18) status = 'full';
        else status = 'valid';
    }

    const shownPoints = result !== null && prefersReducedMotion() ? result.score : points;

    let counter = '';
    if (status === 'invalid') {
        counter = 'No está en el diccionario';
    } else if (word.length > 0 && !finished) {
        counter = `${word.length} ${word.length === 1 ? 'letra' : 'letras'}`;
        if (word.length < MIN_LETTERS) counter += ` · mínimo ${MIN_LETTERS}`;
    }

    function submit() {
        if (dictionary !== null) dispatch({ type: 'submit', dictionary });
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Forma la palabra más larga</h2>

            <output aria-label="Tu palabra" data-status={status} className={styles.board}>
                {slots.map((letter, index) => (
                    <span key={index} data-testid="slot" className={styles.slot}>
                        {letter !== undefined && (
                            <span style={delayStyle(index)} className={styles.letter}>
                                {letter}
                            </span>
                        )}
                        {letter !== undefined && (status === 'valid' || status === 'full') && (
                            <span aria-hidden="true" style={delayStyle(index)} className={styles.plus}>
                                +1
                            </span>
                        )}
                    </span>
                ))}
            </output>
            
            <p data-testid="counter" className={styles.counter}>
                {status === 'valid' || status === 'full' ? (
                    <>
                        <b>{shownPoints}</b> {shownPoints === 1 ? 'punto' : 'puntos'}
                    </>
                ) : (
                    counter
                )}
            </p>

            <ul aria-label="Letras" className={styles.letters}>
                {state.tiles.map((tile, index) => (
                    <li key={tile.id}>
                        <button
                            onClick={() => dispatch({ type: 'pick', id: tile.id })}
                            disabled={spinning || isPicked(state, tile.id) || finished}
                            data-used={isPicked(state, tile.id)}
                            data-spinning={spinning}
                            aria-label={tile.letter}
                            className={`${styles.tile} ${index < landed ? styles.landed : ''}`}
                        >
                            {index < landed ? (
                                tile.letter
                            ) : (
                                <span aria-hidden="true" style={reelStyle(reels[index], index)} className={styles.reel}>
                                    {reels[index].map((letter, position) => (
                                        <span key={position}>{letter}</span>
                                    ))}
                                </span>
                            )}
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

            {result !== null && revealed && (
                <section aria-label="Resultado" className={styles.result}>
                    <dl>
                        <dt>Palabra</dt>
                        <dd>{result.word}</dd>
                        <dt>¿Vale?</dt>
                        <dd>{result.isValid ? 'Sí, está en el diccionario' : 'No está en el diccionario'}</dd>
                        <dt>Letras</dt>
                        <dd>{result.word.length}</dd>
                        <dt>Puntos</dt>
                        <dd className={styles.score}>{result.score}</dd>
                    </dl>
                </section>
            )}
        </div>
    );
}

export default LettersGame;
