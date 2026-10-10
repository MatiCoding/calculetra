import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import UnderConstruction from './components/UnderDevelopment/UnderDevelopment.tsx'
import { IS_UNDER_CONSTRUCTION } from './config/flags'
import { AuthProvider } from './auth/AuthProvider.tsx'

function Root() {
  if (IS_UNDER_CONSTRUCTION) return <UnderConstruction />

  // The router lives here and not in App, so tests can wrap App in a
  // MemoryRouter instead (a router inside another router is an error).
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default Root
