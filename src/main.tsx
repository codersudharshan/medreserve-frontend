  import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AppContextProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'

/**
 * Main entry point for the MedReserve application
 * Wraps the app with BrowserRouter for client-side routing
 * and AppContextProvider for global state management
 * Dark mode removed - light theme only
 */
// Log theme info on app start
console.info('Theme: light only — dark mode disabled')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
