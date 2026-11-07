import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router'
import { useEffect } from 'react'

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

// Cifras plays its entrance only when it comes from the home page, which says so in the navigation state.
function CifrasPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const intro = location.state?.intro === true

  // Forget the state, so reloading the page does not play the entrance again.
  useEffect(() => {
    if (intro) navigate(location.pathname, { replace: true })
  }, [intro, navigate, location.pathname])

  return <NumbersGame intro={intro} />
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
          <Route path="/cifras" element={<main><BackToGames /><CifrasPage /></main>} />
          <Route path="/letras" element={<main><BackToGames /><LettersGame /></main>} />
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