import styles from './UnderConstruction.module.css';

const NUMBER_TILES = [100, 75, 50, 25, 8, 3];
const LETTER_TILES = ['C', 'A', 'L', 'C', 'U', 'L', 'E', 'T', 'R', 'A'];

function UnderConstruction() {
    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <p className={styles.badge}>🚧 En construcción</p>

                <h1 className={styles.title} aria-label="Calculetra">
                    {LETTER_TILES.map((letter, index) => (
                        <span
                            key={index}
                            className={styles.letterTile}
                            style={{ animationDelay: `${index * 80}ms` }}
                            aria-hidden="true"
                        >
                            {letter}
                        </span>
                    ))}
                </h1>

                <ul className={styles.numbers} aria-hidden="true">
                    {NUMBER_TILES.map((number, index) => (
                        <li
                            key={index}
                            className={styles.numberTile}
                            style={{ animationDelay: `${index * 120}ms` }}
                        >
                            {number}
                        </li>
                    ))}
                </ul>

                <p className={styles.subtitle}>
                    Estamos preparando el reto diario de cifras y letras.
                </p>
                <p className={styles.text}>
                    Cada día, un nuevo desafío igual para todos. Vuelve pronto para jugar.
                </p>

                <a
                    className={styles.link}
                    href="https://github.com/MatiCoding/calculetra"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Sigue el desarrollo en GitHub
                </a>
            </section>
        </main>
    );
}

export default UnderConstruction;