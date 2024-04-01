import { createRoot } from 'react-dom/client'

import { MainLayout } from './layouts/main'

import { ThemeProvider } from './components/theme-provider'

const root = createRoot(document.getElementById('app')!)

root.render(
  <ThemeProvider>
    <MainLayout />
  </ThemeProvider>
)
