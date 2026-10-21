import { useState } from 'react'
import { Route, Routes } from 'react-router'

import Header from './components/Header/Header'
import ModeSwitch from './components/ModeSwitch/ModeSwitch'
import NumbersGame from './components/NumbersGame/NumbersGame'
import LettersGame from './components/LettersGame/LettersGame'
import Footer from './components/Footer/Footer'
import type { GameType } from './types/gameType'
import SignUpForm from './components/SignUpForm/SignUpForm'
import NotFound from './components/NotFound/NotFound'
import LogInForm from './components/LogInForm/LogInForm'
import RequireAuth from './components/RequireAuth/RequireAuth'
import AccountPage from './components/AccountPage/AccountPage'
import ForgotPasswordForm from './components/ForgotPasswordForm/ForgotPasswordForm'
import ResetPasswordPage from './components/ResetPasswordPage/ResetPasswordPage'

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
        <Route path="/signup" element={<main><SignUpForm /></main>} />
        <Route path="/login" element={<main><LogInForm /></main>} />
        <Route path="/account" element={<main><RequireAuth><AccountPage /></RequireAuth></main>} />
        <Route path="/forgot-password" element={<main><ForgotPasswordForm /></main>} />
        <Route path="/reset-password" element={<main><ResetPasswordPage /></main>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
