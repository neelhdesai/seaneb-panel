import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PendingConsultantsProvider } from "./context/PendingConsultantsContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PendingConsultantsProvider>
      <App />
    </PendingConsultantsProvider>
  </StrictMode>,
)
