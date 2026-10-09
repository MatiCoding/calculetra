import type { GameType } from '../../types/gameType'

type ModeSwitchProps = {
    gameMode: GameType
    setGameMode: (mode: GameType) => void
}

function ModeSwitch({ gameMode, setGameMode }: ModeSwitchProps) {
    return (
        <button type="button" onClick={() => setGameMode(gameMode === 'numbers' ? 'letters' : 'numbers')}>
            {gameMode === 'numbers' ? 'Cambiar a letras' : 'Cambiar a números'}
        </button>
    );
}

export default ModeSwitch