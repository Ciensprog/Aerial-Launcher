import { createRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { KickAllPartyCard } from './-kick-all-party'
import { ClaimRewardsCard } from './-claim-rewards'
import { FriendRequestCard } from './-friend-request'
import { InviteCard } from './-invite'
import { LeavePartyCard } from './-leave-party'
import { PartyStatusCard } from './-status'

import { useClaimedRewardsNotifications } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/party',
  component: RouteComponent,
})

export function RouteComponent() {
  const { t } = useTranslation(['sidebar'])

  useClaimedRewardsNotifications()

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <HomeBreadcrumb />
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('stw-operations.title')}</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {t('stw-operations.options.party')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-center w-full">
        <div className="flex w-full max-w-lg flex-col items-stretch gap-2">
          <PartyStatusCard />
          <KickAllPartyCard />
          <LeavePartyCard />
          <div className="flex gap-2">
            <ClaimRewardsCard />
            <FriendRequestCard />
          </div>
          <InviteCard />
        </div>
      </div>
    </>
  )
}
