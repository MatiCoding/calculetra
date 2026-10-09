import App from './App.tsx'
import UnderConstruction from './components/UnderDevelopment/UnderDevelopment.tsx'
import { IS_UNDER_CONSTRUCTION } from './config/flags'

function Root() {
  return IS_UNDER_CONSTRUCTION ? <UnderConstruction /> : <App />
}

export default Root
