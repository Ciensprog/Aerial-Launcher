import { Link, createRoute } from '@tanstack/react-router'
import { Info } from 'lucide-react'

import { Route as RootRoute } from '../../__root'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
// import { Button } from '../../../components/ui/button'

import { KickAllPartyCard } from './-kick-all-party'
import { ClaimRewardsCard } from './-claim-rewards'
import { InviteCard } from './-invite'
import { LeavePartyCard } from './-leave-party'

import { useClaimedRewardsNotifications } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/party',
  component: RouteComponent,
})

export function RouteComponent() {
  useClaimedRewardsNotifications()

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>STW Operations</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Party</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-grow">
        <div className="flex items-center justify-center w-full">
          <div className="flex flex-col items-center space-y-5 w-full">
            <KickAllPartyCard />
            <div className="flex gap-5 items-center justify-center">
              <ClaimRewardsCard />
              <LeavePartyCard />
            </div>

            <InviteCard />

            <Alert className="border-0 border-l-4 max-w-lg rounded-none w-full">
              <Info className="h-4 w-4" />
              <AlertTitle>Note:</AlertTitle>
              <AlertDescription>
                If you get some bug/issues with these features you can
                report in the Discord Server. Or you can consider
                contributing if you like.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </>
  )
}
