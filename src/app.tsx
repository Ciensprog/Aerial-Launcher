import { createRoot } from 'react-dom/client'

import { LoadAccounts } from './bootstrap/components/load-accounts'

import { MainLayout } from './layouts/main'

import { ThemeProvider } from './components/theme-provider'

const root = createRoot(document.getElementById('app')!)

root.render(
  <ThemeProvider>
    <LoadAccounts />
    <MainLayout />
  </ThemeProvider>
)
