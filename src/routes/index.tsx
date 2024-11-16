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

import { useFetchPlayerDataSync } from './-index/-hooks'

import { cn } from '../lib/utils'

enum IndexTabs {
  Home = 'home',
  AlertsOverview = 'alerts-overview',
  AlertsDone = 'alerts-done',
}

const defaultTab = IndexTabs.AlertsOverview

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

          <Tabs
            className={cn(
              'mb-5 mt-4 max-w-lg mx-auto',
              '[&_.tab-content]:mt-4'
            )}
            defaultValue={defaultTab}
          >
            <div
              className="flex items-center"
              id="alert-navigation-container"
            >
              <TabsList className="">
                <TabsTrigger value={IndexTabs.Home}>Home</TabsTrigger>
                <TabsTrigger value={IndexTabs.AlertsOverview}>
                  Alerts Overview
                </TabsTrigger>
                <TabsTrigger value={IndexTabs.AlertsDone}>
                  Alerts Done
                </TabsTrigger>
              </TabsList>
              <FetchAlertsButton />
            </div>
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
