import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'

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
import { Input } from '../../../components/ui/input'

import { useHomebaseNameData } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/homebase-name',
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
              <BreadcrumbPage>Homebase Name</BreadcrumbPage>
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
    error,
    isDisabledForm,
    isLoading,
    name,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    handleSave,
    handleUpdateName,
    homebaseNameUpdateAccounts,
    homebaseNameUpdateTags,
  } = useHomebaseNameData()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <Card className="max-w-lg w-full">
          <CardHeader className="border-b">
            <CardDescription>
              Update homebase name (no longer visible in game) of the
              selected accounts.
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
              onUpdateAccounts={homebaseNameUpdateAccounts}
              onUpdateTags={homebaseNameUpdateTags}
            />
            <Input
              className="mt-2 pr-20"
              placeholder="Set a homebase name"
              value={name}
              onChange={handleUpdateName}
            />

            {error && (
              <div className="border-l-4 border-red-400 ml-2 pl-2 text-red-400">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="space-x-6">
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={isDisabledForm}
            >
              {isLoading ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                `Update Homebase Name`
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
