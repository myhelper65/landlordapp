import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { CssBaseline, ThemeProvider } from '@mui/material'
import './index.css'
import theme from './theme'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* SİHİRLİ DOKUNUŞ: Ekranı %100 özgür bırakır! */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)