import { Outlet, Route, Routes } from 'react-router'

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
          <Route path="/cifras" element={<main><BackToGames /><NumbersGame /></main>} />
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