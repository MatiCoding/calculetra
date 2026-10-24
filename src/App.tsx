import { useState } from 'react'
import { Outlet, Route, Routes } from 'react-router'

import Header from './components/Header/Header'
import ModeSwitch from './components/ModeSwitch/ModeSwitch'
import NumbersGame from './components/NumbersGame/NumbersGame'
import LettersGame from './components/LettersGame/LettersGame'
import Footer from './components/Footer/Footer'
import type { GameType } from './types/gameType'
import AuthPage from './components/AuthPage/AuthPage'
import NotFound from './components/NotFound/NotFound'
import RequireAuth from './components/RequireAuth/RequireAuth'
import AccountPage from './components/AccountPage/AccountPage'
import ForgotPasswordForm from './components/ForgotPasswordForm/ForgotPasswordForm'
import ResetPasswordPage from './components/ResetPasswordPage/ResetPasswordPage'
import NoticeDialog from './components/NoticeDialog/NoticeDialog'

function WithHeader() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

function App() {
  const [gameMode, setGameMode] = useState<GameType>('numbers')
  return (
    <>
      <Routes>
        <Route element={<WithHeader />}>
          <Route
            path="/"
            element={
              <>
                <NoticeDialog />
                <ModeSwitch gameMode = {gameMode} setGameMode = {setGameMode} />
                <main>
                  { gameMode === 'numbers' ? <NumbersGame /> : <LettersGame /> }
                </main>
              </>
            }
          />
          <Route path="/account" element={<main><RequireAuth><AccountPage /></RequireAuth></main>} />
          <Route path="/forgot-password" element={<main><ForgotPasswordForm /></main>} />
          <Route path="/reset-password" element={<main><ResetPasswordPage /></main>} />
        </Route>

        <Route path="/signup" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App