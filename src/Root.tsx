import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import UnderConstruction from './components/UnderDevelopment/UnderDevelopment.tsx'
import { IS_UNDER_CONSTRUCTION } from './config/flags'
import { AuthProvider } from './auth/context/AuthProvider.tsx'

function Root() {
  if (IS_UNDER_CONSTRUCTION) return <UnderConstruction />

  // The router lives here and not in App, so tests can wrap App in a
  // MemoryRouter instead (a router inside another router is an error).
  // useTransitions={false}: a page change is a normal React update, not a
  // low-priority one. Otherwise, after deleting the account, logging out
  // could be drawn before the move to "/" and RequireAuth would send the
  // user to /login.
  return (
    <BrowserRouter useTransitions={false}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default Root