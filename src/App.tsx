import { useState } from 'react'
import { Route, Routes } from 'react-router'

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
      <Routes>
        <Route
          path="/"
          element={
            <>
              <ModeSwitch gameMode = {gameMode} setGameMode = {setGameMode} />
              <main>
                { gameMode === 'numbers' ? <NumbersGame /> : <LettersGame /> }
              </main>
            </>
          }
        />
        {/* Placeholder until the sign up form exists. */}
        <Route path="/signup" element={<main><h2>Crear cuenta</h2></main>} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
