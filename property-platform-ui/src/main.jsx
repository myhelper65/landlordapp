import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from '@mui/material/styles'
import theme from './theme'

// MUI'nin tüm varsayılan tarayıcı boşluklarını (margin/padding) sıfırlayan aracı
import { CssBaseline } from '@mui/material'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* SİHİRLİ DOKUNUŞ: Ekranı %100 özgür bırakır! */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)