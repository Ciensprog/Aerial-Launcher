import { createRoute } from '@tanstack/react-router'

import { CheckNewVersion } from '../bootstrap/components/check-new-version'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs'

import { AlertsOverview } from './-index/-alerts-overview/-index'
import { FetchAlertsButton } from './-index/-components/-fetch-alerts-button'
import { GoToTop } from './-index/-components/-go-to-top'
import { HomeAlerts } from './-index/-home/-index'
import { CommunityInfo } from './-index/-community-info'
import { AlertsDone } from './-index/alerts-done'
// import { HeaderNavigation } from './-index/-header-navigation'
import { Route as RootRoute } from './__root'

import { useGetAccounts } from '../hooks/accounts'
import { useFetchPlayerDataSync } from './-index/-hooks'

import { cn } from '../lib/utils'

enum IndexTabs {
  Home = 'home',
  AlertsOverview = 'alerts-overview',
  AlertsDone = 'alerts-done',
}

const defaultTab = IndexTabs.Home

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: IndexComponent,
})

export function IndexComponent() {
  useFetchPlayerDataSync()

  return (
    <>
      {/* <HeaderNavigation /> */}
      <CheckNewVersion />

      <div className="flex flex-grow">
        <div className="w-full">
          <CommunityInfo />

          <section className="border-l-8 mt-4 max-w-lg mx-auto px-2 py-1 text-sm">
            <h2 className="font-medium text-muted-foreground">
              Good To Know:
            </h2>
            <ul className="list-disc ml-5 text-muted-foreground">
              <li>
                Click on the Aerial logo (top left corner) to return here.
              </li>
              <li>
                Drag and drop a World Info file onto the page to load other
                missions/alerts.
              </li>
            </ul>
          </section>

          <Tabs
            className={cn(
              'mb-5 mt-4 max-w-lg mx-auto',
              '[&_.tab-content]:mt-6'
            )}
            defaultValue={defaultTab}
          >
            <NavigationTab />
            <TabsContent
              className="tab-content"
              value={IndexTabs.Home}
            >
              <HomeAlerts />
            </TabsContent>
            <TabsContent
              className="tab-content"
              value={IndexTabs.AlertsOverview}
            >
              <AlertsOverview />
            </TabsContent>
            <TabsContent
              className="tab-content"
              value={IndexTabs.AlertsDone}
            >
              <AlertsDone />
            </TabsContent>
          </Tabs>

          <GoToTop />
        </div>
      </div>
    </>
  )
}

function NavigationTab() {
  const { accountsArray } = useGetAccounts()

  const alertsDoneTabDisabled = accountsArray.length <= 0

  return (
    <div
      className="flex items-center"
      id="alert-navigation-container"
    >
      <TabsList>
        <TabsTrigger value={IndexTabs.Home}>Home</TabsTrigger>
        <TabsTrigger value={IndexTabs.AlertsOverview}>
          Alerts Overview
        </TabsTrigger>
        <TabsTrigger
          value={IndexTabs.AlertsDone}
          disabled={alertsDoneTabDisabled}
        >
          Alerts Done
        </TabsTrigger>
      </TabsList>
      <FetchAlertsButton />
    </div>
  )
}
