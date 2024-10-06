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
import { Textarea } from '../../../components/ui/textarea'

import { useRedeemCodesData } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/redeem-codes',
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
              <BreadcrumbPage>Redeem Codes</BreadcrumbPage>
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
    codes,
    isDisabledForm,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    handleUpdateCodes,
    handleSave,
    redeemCodesUpdateAccounts,
    redeemCodesUpdateTags,
  } = useRedeemCodesData()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <div className="max-w-lg space-y-4 w-full">
          <Card className="w-full">
            <CardHeader className="border-b">
              <CardDescription>
                Redeem codes on each selected accounts.
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
                onUpdateAccounts={redeemCodesUpdateAccounts}
                onUpdateTags={redeemCodesUpdateTags}
              />
              <Textarea
                className="[field-sizing:content] resize-none"
                placeholder="Set codes to redeem (use newline)."
                value={codes}
                onChange={handleUpdateCodes}
                disabled={isLoading}
              />
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
                  'Redeem Codes'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
