import { createTheme, MantineProvider } from '@mantine/core'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import dayjs from 'dayjs'
import { createRoot } from 'react-dom/client'

import { IndexComponent } from './routes'
import { routeTree } from './routeTree.gen'

import { LoadMatchmakingPath } from './bootstrap/components/advanced-mode/load-matchmaking-path'
// import { LoadWorldInfoFiles } from './bootstrap/components/advanced-mode/load-world-info-files'
import {
  LoadHomeWorldInfo,
  LoadWorldInfoData,
} from './bootstrap/components/advanced-mode/load-world-info'
import { LoadAccounts } from './bootstrap/components/load-accounts'
import { LoadAutoLlamas } from './bootstrap/components/load-auto-llamas'
import { LoadAutomation } from './bootstrap/components/load-automation'
import { LoadFriends } from './bootstrap/components/load-friends'
import { LoadGroups } from './bootstrap/components/load-groups'
import { LoadSettings } from './bootstrap/components/load-settings'
import { LoadTags } from './bootstrap/components/load-tags'

import { SonnerToaster } from './components/ui/sonner'
import { Toaster } from './components/ui/toaster'
import { ThemeProvider } from './components/theme-provider'

import 'dayjs/locale/es'
import './locale'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(utc)

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
      <LoadFriends />
      <LoadHomeWorldInfo />
      <LoadWorldInfoData />
      {/* <LoadWorldInfoFiles /> */}
      <LoadMatchmakingPath />
      <LoadAutomation />
      <LoadAutoLlamas />

      <RouterProvider
        router={router}
        /**
         * Used when app is packaged (static, default home)
         */
        defaultNotFoundComponent={IndexComponent}
      />

      <SonnerToaster position="bottom-center" />
      <Toaster />
    </ThemeProvider>
  </MantineProvider>
)

export { router }
