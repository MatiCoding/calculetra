import App from './App.tsx'
import UnderConstruction from './components/UnderDevelopment/UnderDevelopment.tsx'
import { IS_UNDER_CONSTRUCTION } from './config/flags'
import { AuthProvider } from './auth/AuthProvider.tsx'

function Root() {
  return IS_UNDER_CONSTRUCTION ? <UnderConstruction /> : <AuthProvider> <App /> </AuthProvider>
}

export default Root
