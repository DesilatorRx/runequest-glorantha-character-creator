import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setHomebrew } from './data/registry'
import { loadHomebrew } from './state/homebrew'

// Homebrew must be in place before saved adventurers are loaded, since they may use it.
setHomebrew(loadHomebrew())
import { track } from './analytics'

window.addEventListener('beforeprint', () => track('print', 'Printed a sheet'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
