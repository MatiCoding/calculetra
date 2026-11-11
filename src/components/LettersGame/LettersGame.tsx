import { useEffect, useReducer, useState, useMemo, type CSSProperties } from 'react';
import { getDailyLetters } from '../../domain/letras/challengeLetras';
import { loadDictionary } from '../../domain/letras/dictionaryLetras';
import { gameReducer, getWord, initialState, isPicked, getSlots, usesAllHints } from '../../domain/letras/gameLetras';
import { canSubmit } from '../../domain/letras/wordLetras';
import { formatCountdown, msUntilNextChallenge } from '../../domain/shared/date';
import { MAX_HINTS_LETRAS, findLongestWord, getHintPositions } from '../../domain/letras/hintsLetras';
import { nextHintCost } from '../../domain/letras/scoreLetras';
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

// Entrance from the home page: the blue shrinks onto the nine keys, and then they spin.
// Each blue circle starts a bit later than the one before.
const MAGNET_GAP_MS = 40;
// How long a circle takes to shrink into its key.
const MAGNET_MS = 750;
// How long the whole entrance lasts: until the last circle has arrived.
const INTRO_MS = MAGNET_MS + 8 * MAGNET_GAP_MS;

// How long until the next letters, updated every second.
function NextChallenge() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <p className={styles.next}>
            Nuevas letras en <b>{formatCountdown(msUntilNextChallenge(now))}</b>
        </p>
    )
}

type Props = {
    loadWords?: () => Promise<Set<string>>;
    intro?: boolean;
};

function LettersGame({ loadWords = loadDictionary, intro = false }: Props) {
    const [playingIntro, setPlayingIntro] = useState(intro);

    // When the entrance ends, the circles are removed.
    useEffect(() => {
        if (!playingIntro) return;
        const timer = setTimeout(() => setPlayingIntro(false), INTRO_MS);
        return () => clearTimeout(timer);
    }, [playingIntro]);

    // The day is fixed when the game opens, so the letters and the hints are from the same day.
    const [today] = useState(() => new Date());
    const [dailyLetters] = useState(() => getDailyLetters(today));
    const [state, dispatch] = useReducer(gameReducer, dailyLetters, initialState);
    const [dictionary, setDictionary] = useState<Set<string> | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    
    const longestWord = useMemo(
        () => (dictionary === null ? null : findLongestWord(dailyLetters, dictionary)),
        [dictionary, dailyLetters],
    )

    const hintPositions = useMemo(
        () => (longestWord === null ? [] : getHintPositions(today, longestWord.length)),
        [longestWord, today],
    )

    const[reels, setReels] = useState(() => state.tiles.map((tile, index) => createReel(tile.letter, index)));
    const [landed, setLanded] = useState(() => (prefersReducedMotion() ? state.tiles.length : 0));  // How many keys have stopped spinning. They stop from left to right.
    const spinning = landed < state.tiles.length;

    // Stops the reels one by one.
    // Stops the reels one by one. During the entrance they wait under the blue.
    useEffect(() => {
        if (playingIntro || prefersReducedMotion()) return;
        const timers = reels.map((_, index) => setTimeout(() => setLanded(index + 1), spinTime(index)));
        return () => timers.forEach(clearTimeout);
    }, [reels, playingIntro]);


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
    }, [dictionary, spinning]);

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
        // With hints a valid word can score 0, and then there is nothing to count.
        if (result === null || !result.isValid || result.score === 0 || prefersReducedMotion()) return;
        const score = result.score;
        const step = result.word.length === SLOTS ? HOP_STEP / 2 : HOP_STEP;
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
    const slots = getSlots(state);
    const hasLetters = state.picked.length > 0;  // letters written by the player, not the hints

    const hintsLeft = Math.min(MAX_HINTS_LETRAS, hintPositions.length) - state.hints.length;
    const nextCost = nextHintCost(state.hints.length);

    let status: BoardStatus = 'playing';
    if (result !== null) {
        if (!result.isValid) status = 'invalid';
        else if (result.word.length === SLOTS) status = 'full';
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

    // Starts the game over, the word, the result and the spin of the letters.
    function playAgain() {
        dispatch({type: 'restart'});
        setRevealed(false);
        setPoints(0);
        setLanded(prefersReducedMotion() ? state.tiles.length: 0);
        setReels(state.tiles.map((tile, index) => createReel(tile.letter, index)));
    }

    // Puts the next letter of the longest word in its slot.
    function giveHint() {
        if (longestWord === null || hintsLeft <= 0) return;
        const position = hintPositions[state.hints.length];
        dispatch({ type: 'hint', position, letter: longestWord[position] });
    }

    function submit() {
        if (dictionary !== null) dispatch({ type: 'submit', dictionary });
    }

    return (
        <div className={`${styles.container} ${playingIntro ? styles.intro : ''}`}>
            <h2 className={styles.title}>Forma la palabra más larga</h2>

            <output aria-label="Tu palabra" data-status={status} className={styles.board}>
                {slots.map((letter, index) => (
                    <span key={index} data-testid="slot" className={styles.slot}>
                        {letter !== null && (
                            <span style={delayStyle(index)} data-hint={state.hintsShown && state.hints.some((hint) => hint.position === index)} className={styles.letter}>
                                {letter}
                            </span>
                        )}
                        {letter !== null && (status === 'valid' || status === 'full') && (
                            <span aria-hidden="true" style={delayStyle(index)} className={styles.plus}>
                                +1
                            </span>
                        )}
                    </span>
                ))}
            </output>
            
            {!revealed && (
                <>
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
                                {playingIntro && (
                                    <span
                                        className={styles.magnet}
                                        data-testid="intro-magnet"
                                        aria-hidden="true"
                                        style={{ animationDelay: `${index * MAGNET_GAP_MS}ms` }}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                    
                    <div className={styles.actions}>
                        <button onClick={() => dispatch({ type: 'removeLast' })} disabled={!hasLetters || finished} className={styles.secondary}>
                            Borrar letra
                        </button>
                        <button onClick={() => dispatch({ type: 'clear' })} disabled={!hasLetters || finished} className={styles.secondary}>
                            Borrar todo
                        </button>
                        <button onClick={submit} disabled={dictionary === null || !canSubmit(word, letters) || !usesAllHints(state) || finished} className={styles.primary}>
                            Enviar
                        </button>
                    </div>

                    <div className={styles.hintBox}>
                        <button
                            onClick={giveHint}
                            disabled={spinning || finished || longestWord === null || hintsLeft <= 0}
                            className={`${styles.secondary} ${styles.hintButton}`}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
                                <path d="M9 21h6" />
                            </svg>
                            Pista · quedan {Math.max(hintsLeft, 0)}
                        </button>
                        {state.hints.length > 0 && (
                            <button
                                onClick={() => dispatch({ type: 'toggleHints' })}
                                disabled={spinning || finished}
                                className={styles.secondary}
                            >
                                {state.hintsShown ? 'Quitar pistas' : 'Ver pistas'}
                            </button>
                        )}                        
                        <span className={styles.cost}>
                            {hintsLeft > 0 ? `La siguiente resta ${nextCost} ${nextCost === 1 ? 'punto' : 'puntos'}` : 'No quedan pistas'}
                        </span>
                    </div>                    
                </>
            )} 

            {dictionary === null && !loadFailed && <p className={styles.status}>Cargando diccionario...</p>}
            {loadFailed && (
                <p role="alert" className={styles.error}>No se ha podido cargar el diccionario. Recarga la página para jugar.</p>
            )}

            {result !== null && revealed && (
                <section aria-label="Resultado" className={styles.result}>
                    <p className={styles.resultHead} data-valid={result.isValid}>
                        {!result.isValid ? 'No está en el diccionario' : result.score === 18 ? '¡Las nueve!' : '¡Vale!'}
                    </p>
                    <p className={styles.score} data-valid={result.isValid}>{result.score}</p>
                    <p className={styles.resultWord}>
                        {result.score} puntos con <b>{result.word}</b>
                    </p>
                    <button onClick={playAgain} className={styles.primary}>
                        Volver a jugar
                    </button>
                    <NextChallenge />
                </section>
            )}
        </div>
    );
}

export default LettersGame;
