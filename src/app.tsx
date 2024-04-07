import { RouterProvider, createRouter } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import { IndexComponent } from './routes'
import { routeTree } from './routeTree.gen'

import { LoadAccounts } from './bootstrap/components/load-accounts'

import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from './components/theme-provider'

const root = createRoot(document.getElementById('app')!)
const router = createRouter({ routeTree })

root.render(
  <ThemeProvider>
    <LoadAccounts />
    <RouterProvider
      router={router}
      /**
       * Used when app is packaged (static, default home)
       */
      defaultNotFoundComponent={IndexComponent}
    />
    <Toaster position="bottom-center" />
  </ThemeProvider>
)

export { router }
