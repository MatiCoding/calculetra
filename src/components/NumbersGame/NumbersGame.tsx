import styles from './NumbersGame.module.css';

const NUMBER_TARGET = 325
const NUMBERS_AVAILABLE = [100, 75, 50, 25, 8, 3]

function NumbersGame() {
    return (
        <div>
            <h2 className={styles.target}>Objetivo: {NUMBER_TARGET}</h2>
            <h3>Números disponibles:</h3>
            <ul className={styles.numbersUl}>
                {NUMBERS_AVAILABLE.map((number, index) => (
                    <li key={index} className={styles.numbersLi}>
                        {number}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NumbersGame