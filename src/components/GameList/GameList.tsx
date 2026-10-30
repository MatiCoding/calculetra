import { useState } from 'react';
import styles from './GameList.module.css';

// The games in the order they appear in the list. Only one card is open.
const GAMES = [
    {
        name: 'Cifras',
        className: styles.cifras,
        mini: '75',
        badge: 'Hoy',
        text: 'Seis números, cuatro operaciones y un objetivo de tres cifras.',
        tiles: ['75', '8', '6', '25', '3'],
        playable: true,
    },
    {
        name: 'Letras',
        className: styles.letras,
        mini: 'L',
        badge: 'Hoy',
        text: 'Nueve letras para la palabra más larga.',
        tiles: ['L', 'E', 'T', 'R', 'A'],
        playable: true,
    },
    {
        name: 'Más retos',
        className: styles.more,
        mini: '+',
        badge: 'Pronto',
        text: 'Estadísticas, rachas y clasificación llegarán con las cuentas.',
        tiles: [],
        playable: false,
    },
];

type GameListProps = {
    // Called with the game and its open card, so the page can grow it.
    onPlay: (game: string, card: HTMLElement) => void;
};

function GameList({ onPlay }: GameListProps) {
    const [open, setOpen] = useState(0);

    return (
        <div className={styles.list}>
            {GAMES.map((game, i) => {
                const isOpen = open === i;
                const bodyId = `game-list-${i}`;
                return (
                    <section key={game.name} className={`${styles.card} ${game.className}`} data-open={isOpen}>
                        <h2 className={styles.title}>
                            <button
                                type="button"
                                className={styles.head}
                                aria-expanded={isOpen}
                                aria-controls={bodyId}
                                onClick={() => setOpen(i)}
                            >
                                <span className={styles.mini} aria-hidden="true">{game.mini}</span>
                                {game.name}{' '}
                                <span className={styles.badge}>{game.badge}</span>
                            </button>
                        </h2>
                        <div id={bodyId} className={styles.body} inert={!isOpen}>
                            <div className={styles.inner}>
                                <p>{game.text}</p>
                                {game.tiles.length > 0 && (
                                    <div className={styles.tiles} aria-hidden="true">
                                        {game.tiles.map((tile) => <span key={tile}>{tile}</span>)}
                                    </div>
                                )}
                                {game.playable ? (
                                    <button
                                        type="button"
                                        className={styles.go}
                                        onClick={(event) => onPlay(game.name, event.currentTarget.closest('section')!)}
                                    >
                                        Jugar el reto <b aria-hidden="true">🡆</b>
                                    </button>
                                ) : (
                                    <span className={styles.soon}>Próximamente</span>
                                )}
                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

export default GameList;