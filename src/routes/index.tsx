import { createRoute } from '@tanstack/react-router'

import { CheckNewVersion } from '../bootstrap/components/check-new-version'

import { Button } from '../components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs'

import { AlertsOverview } from './-index/-alerts-overview/-index'
import { HomeAlerts } from './-index/-home/-index'
import { CommunityInfo } from './-index/-community-info'
// import { HeaderNavigation } from './-index/-header-navigation'
import { Route as RootRoute } from './__root'

import { cn } from '../lib/utils'
import { AlertsDone } from './-index/alerts-done'

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
  return (
    <>
      {/* <HeaderNavigation /> */}
      <CheckNewVersion />

      <div className="flex flex-grow">
        <div className="w-full">
          <CommunityInfo />

          <Tabs
            className={cn(
              'h-full mt-4 max-w-lg mx-auto',
              '[&_.tab-content]:mt-4'
            )}
            defaultValue={defaultTab}
          >
            <div className="flex items-center">
              <TabsList className="">
                <TabsTrigger value={IndexTabs.Home}>Home</TabsTrigger>
                <TabsTrigger value={IndexTabs.AlertsOverview}>
                  Alerts Overview
                </TabsTrigger>
                <TabsTrigger value={IndexTabs.AlertsDone}>
                  Alerts Done
                </TabsTrigger>
              </TabsList>
              <Button
                className="ml-auto"
                variant="secondary"
              >
                Fetch Alerts
              </Button>
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
        </div>
      </div>
    </>
  )
}
