import { RouterProvider, createRouter } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import { LoadAccounts } from './bootstrap/components/load-accounts'

import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from './components/theme-provider'

import { routeTree } from './routeTree.gen'

const root = createRoot(document.getElementById('app')!)
const router = createRouter({ routeTree })

root.render(
  <ThemeProvider>
    <LoadAccounts />
    <RouterProvider router={router} />
    <Toaster position="bottom-center" />
  </ThemeProvider>
)

export { router }
