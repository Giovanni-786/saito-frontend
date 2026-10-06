import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider as JotaiProvider } from 'jotai'
import { ThemeProvider } from '@mui/material/styles'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'sonner'
import './index.css'
import AppRoutes from './routes/AppRoutes.tsx'
import { queryClient } from './utils/queryClient.ts'
import { store } from './store'
import { muiTheme } from './theme/muiTheme.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JotaiProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={muiTheme}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          {/* Container único dos toasts: qualquer componente dispara com `toast(...)`. */}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </QueryClientProvider>
    </JotaiProvider>
  </StrictMode>,
)
