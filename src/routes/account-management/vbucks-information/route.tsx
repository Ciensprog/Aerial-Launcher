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

import { useVBucksInformationData } from './-hooks'

// import { cn, parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/vbucks-information',
  component: () => {
    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Account Management</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>V-Bucks Information</BreadcrumbPage>
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
    handleGetInfo,
    isDisabledForm,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    vbucksInformationUpdateAccounts,
    vbucksInformationUpdateTags,
  } = useVBucksInformationData()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <div className="max-w-lg space-y-4 w-full">
          <Card className="w-full">
            <CardHeader className="border-b">
              <CardDescription>
                V-Bucks information on each selected accounts.
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
                onUpdateAccounts={vbucksInformationUpdateAccounts}
                onUpdateTags={vbucksInformationUpdateTags}
              />
            </CardContent>
            <CardFooter className="space-x-6">
              <Button
                className="w-full"
                onClick={handleGetInfo}
                disabled={isDisabledForm}
              >
                {isLoading ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  'Show Information'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
