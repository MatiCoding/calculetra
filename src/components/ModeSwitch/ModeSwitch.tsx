import type { GameType } from '../../types/gameType'

import styles from './ModeSwitch.module.css'

type ModeSwitchProps = {
    gameMode: GameType
    setGameMode: (mode: GameType) => void
}

function ModeSwitch({ gameMode, setGameMode }: ModeSwitchProps) {
    return (
        <button type="button" className={styles.button} onClick={() => setGameMode(gameMode === 'numbers' ? 'letters' : 'numbers')}>
            {gameMode === 'numbers' ? 'Cambiar a letras' : 'Cambiar a números'}
        </button>
    );
}

export default ModeSwitch