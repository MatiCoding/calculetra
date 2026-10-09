import { useState } from 'react'

import Header from './components/Header/Header'
import ModeSwitch from './components/ModeSwitch/ModeSwitch'
import NumbersGame from './components/NumbersGame/NumbersGame'
import LettersGame from './components/LettersGame/LettersGame'
import Footer from './components/Footer/Footer'
import type { GameType } from './types/gameType'

function App() {
  const [gameMode, setGameMode] = useState<GameType>('numbers')
  return (
    <>
      <Header />
      <ModeSwitch gameMode = {gameMode} setGameMode = {setGameMode} />
      <main>
        { gameMode === 'numbers' ? <NumbersGame /> : <LettersGame /> }
      </main>
      <Footer />
    </>
  )
}

export default App
