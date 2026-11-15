import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router'
import { useEffect, useCallback, useState } from 'react'

import Header from './components/Header/Header'
import NumbersGame from './components/NumbersGame/NumbersGame'
import Footer from './components/Footer/Footer'
import AuthPage from './components/AuthPage/AuthPage'
import NotFound from './components/NotFound/NotFound'
import RequireAuth from './components/RequireAuth/RequireAuth'
import AccountPage from './components/AccountPage/AccountPage'
import ForgotPasswordForm from './components/ForgotPasswordForm/ForgotPasswordForm'
import ResetPasswordPage from './components/ResetPasswordPage/ResetPasswordPage'
import NoticeDialog from './components/NoticeDialog/NoticeDialog'
import OAuthReturnNotice from './components/OAuthReturnNotice/OAuthReturnNotice'
import PrivacyPage from './components/PrivacyPage/PrivacyPage'
import HomePage from './components/HomePage/HomePage'
import BackToGames from './components/BackToGames/BackToGames'
import LettersGame from './components/LettersGame/LettersGame'

// A game plays its entrance only when it comes from the home page, which says so in the navigation state.
function useIntro(): boolean {
  const location = useLocation()
  const navigate = useNavigate()
  const intro = location.state?.intro === true

  // Forget the state, so reloading the page does not play the entrance again.
  useEffect(() => {
    if (intro) navigate(location.pathname, { replace: true })
  }, [intro, navigate, location.pathname])

  return intro
}

// Starts the exit of the game. When it ends, the page goes home and tells the home page which game it comes from, like the home page does with {intro: true}
function useExit(game: string){
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)
  const start = useCallback(() => setLeaving(true), [])
  const leave = useCallback(() => navigate('/', {state: {from: game}}), [navigate, game])
  return { leaving, start, leave}
}

function CifrasPage() {
  const exit = useExit('Cifras')
  return (
    <>
      <BackToGames game="Cifras" onLeave={exit.start} />
      <NumbersGame intro={useIntro()} leaving={exit.leaving} onLeft={exit.leave} />
    </>
  )
}

function LetrasPage() {
  const exit = useExit('Letras')
  return (
    <>
      <BackToGames game="Letras" onLeave={exit.start} />
      <LettersGame intro={useIntro()} leaving={exit.leaving} onLeft={exit.leave} />
    </>
  )
}

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
  return (
    <>
      <Routes>
        <Route element={<WithHeader />}>
          <Route
            path="/"
            element={
              <>
                <OAuthReturnNotice />
                <NoticeDialog />
                <HomePage />
              </>
            }
          />
          <Route path="/cifras" element={<main><CifrasPage /></main>} />
          <Route path="/letras" element={<main><LetrasPage /></main>} />
          <Route path="/account" element={<main><RequireAuth><AccountPage /></RequireAuth></main>} />
          <Route path="/forgot-password" element={<main><ForgotPasswordForm /></main>} />
          <Route path="/reset-password" element={<main><ResetPasswordPage /></main>} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>

        <Route path="/signup" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App