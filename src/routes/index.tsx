import { createRoute } from '@tanstack/react-router'

import { CheckNewVersion } from '../bootstrap/components/check-new-version'

import { Alerts } from './-home/-alerts/-index'
import { CommunityInfo } from './-home/-community-info'
import { HeaderNavigation } from './-home/-header-navigation'
import { Route as RootRoute } from './__root'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: IndexComponent,
})

export function IndexComponent() {
  return (
    <>
      <HeaderNavigation />
      <CheckNewVersion />

      <div className="flex flex-grow">
        <div className="flex flex-col items-center justify-center w-full">
          <CommunityInfo />
          <Alerts />
        </div>
      </div>
    </>
  )
}
