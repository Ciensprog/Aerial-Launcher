import { createTheme, MantineProvider } from '@mantine/core'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
import { createRoot } from 'react-dom/client'

import { IndexComponent } from './routes'
import { routeTree } from './routeTree.gen'

import { LoadWorldInfoData } from './bootstrap/components/advanced-mode/load-world-info'
import { LoadAccounts } from './bootstrap/components/load-accounts'
import { LoadGroups } from './bootstrap/components/load-groups'
import { LoadSettings } from './bootstrap/components/load-settings'
import { LoadTags } from './bootstrap/components/load-tags'

import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from './components/theme-provider'

dayjs.extend(relativeTime)

const root = createRoot(document.getElementById('app')!)
const router = createRouter({ routeTree })

const theme = createTheme({
  /** Put your mantine theme override here */
})

root.render(
  <MantineProvider theme={theme}>
    <ThemeProvider>
      <LoadSettings />
      <LoadTags />
      <LoadGroups />
      <LoadAccounts />
      <LoadWorldInfoData />

      <RouterProvider
        router={router}
        /**
         * Used when app is packaged (static, default home)
         */
        defaultNotFoundComponent={IndexComponent}
      />
      <Toaster position="bottom-center" />
    </ThemeProvider>
  </MantineProvider>
)

export { router }
