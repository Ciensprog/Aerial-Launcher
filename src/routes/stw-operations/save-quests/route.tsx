import { createRoute } from '@tanstack/react-router'
import { UpdateIcon } from '@radix-ui/react-icons'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { AccountSelectors } from '../../../components/selectors/accounts'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '../../../components/ui/card'
import { Switch } from '../../../components/ui/switch'

import { useClaimedRewardsNotifications } from '../party/-hooks'
import { useData } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/save-quests',
  component: () => {
    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>STW Operations</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Save Quests</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const {
    accounts,
    claimState,
    isLeavePartyLoading,
    isLoading,
    leavePartyButtonIsDisabled,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    saveQuestsButtonIsDisabled,

    changeClaimState,
    handleLeaveParty,
    handleSave,
    saveQuestsUpdateAccounts,
    saveQuestsUpdateTags,
  } = useData()

  useClaimedRewardsNotifications()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <div className="max-w-lg space-y-4 w-full">
          <Card className="w-full">
            <CardHeader className="border-b">
              <CardDescription>
                Save quests progression of the selected accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6">
              <AccountSelectors
                accounts={{
                  options: accounts,
                  value: parsedSelectedAccounts,
                }}
                tags={{
                  options: tags,
                  value: parsedSelectedTags,
                }}
                onUpdateAccounts={saveQuestsUpdateAccounts}
                onUpdateTags={saveQuestsUpdateTags}
              />
            </CardContent>
            <CardFooter className="space-x-6">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saveQuestsButtonIsDisabled}
              >
                {isLoading ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  'Save Quests'
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col flex-shrink-0 justify-center w-full">
            <CardContent className="block pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="pr-5">
                  Claim rewards after leaving mission
                </span>
                <Switch
                  onCheckedChange={changeClaimState}
                  checked={claimState}
                  disabled={leavePartyButtonIsDisabled}
                />
              </div>
              <div className="flex gap-4">
                <Button
                  className="w-full"
                  size="sm"
                  onClick={handleLeaveParty}
                  disabled={leavePartyButtonIsDisabled}
                >
                  {isLeavePartyLoading ? (
                    <UpdateIcon className="animate-spin" />
                  ) : (
                    'Leave Party'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
