import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import UnderConstruction from './components/UnderDevelopment/UnderDevelopment.tsx'
import { IS_UNDER_CONSTRUCTION } from './config/flags'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {IS_UNDER_CONSTRUCTION ? <UnderConstruction /> : <App />}
  </StrictMode>,
)
