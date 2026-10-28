import styles from './FloatingTiles.module.css'

type Game = 'Cifras' | 'Letras'

type FloatingTilesProps = {
    game: Game | null
}

const TILES = [
    { text: '75', game: 'Cifras', x: 6, y: 18 },
    { text: 'C', game: 'Letras', x: 20, y: 30 },
    { text: '8', game: 'Cifras', x: 10, y: 44 },
    { text: 'A', game: 'Letras', x: 22, y: 58 },
    { text: 'R', game: 'Letras', x: 4, y: 62 },
    { text: '100', game: 'Cifras', x: 9, y: 74 },
    { text: 'L', game: 'Letras', x: 20, y: 84 },
    { text: 'E', game: 'Letras', x: 80, y: 18 },
    { text: '25', game: 'Cifras', x: 94, y: 30 },
    { text: 'T', game: 'Letras', x: 84, y: 44 },
    { text: '3', game: 'Cifras', x: 76, y: 60 },
    { text: '6', game: 'Cifras', x: 96, y: 58 },
    { text: 'S', game: 'Letras', x: 90, y: 74 },
    { text: '50', game: 'Cifras', x: 80, y: 84 },
]

function FloatingTiles({game}: FloatingTilesProps) {
    return (
        <div className={styles.sky} data-testid="floating-tiles" data-game={game ?? undefined} aria-hidden="true">
            {TILES.map((tile, i) => (
                <span
                    key={tile.text}
                    className={tile.game === 'Cifras' ? styles.number: styles.letter}
                    data-lit={game === null ? undefined : tile.game === game}
                    style={{left: `${tile.x}%`, top: `${tile.y}%`, animationDelay: `${-i * 0.9}s`}}
                >
                    {tile.text}
                </span>
            ))}
        </div>
    )
}

export default FloatingTiles