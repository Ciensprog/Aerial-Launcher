import { createRoute } from '@tanstack/react-router'
import { UpdateIcon } from '@radix-ui/react-icons'
import Masonry from 'react-responsive-masonry'

import { repositoryAssetsURL } from '../../../config/about/links'

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

import { VBucksInformationData } from '../../../state/management/vbucks-information'

import { useParseAccountInfo, useVBucksInformationData } from './-hooks'

import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { parseCustomDisplayName } from '../../../lib/utils'

const vbucksImageUrl = `${repositoryAssetsURL}/images/resources/currency_mtxswap.png`

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
    data,
    handleGetInfo,
    isDisabledForm,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    vbucksSummary,
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

          {data.length > 0 && (
            <div className="max-w-lg pt-1 w-full">
              <div className="leading-none mb-5 text-center uppercase">
                V-Bucks Summary On {data.length} Account
                {data.length > 1 ? 's' : ''}:
                <div className="flex font-bold gap-1 items-center justify-center text-4xl">
                  <figure className="relative top-0.5">
                    <img
                      src={vbucksImageUrl}
                      className="size-8"
                      alt="vbucks"
                    />
                  </figure>
                  {numberWithCommaSeparator(vbucksSummary)}
                </div>
              </div>

              <Masonry
                columnsCount={2}
                gutter="0.75rem"
              >
                {data.map((item) => (
                  <AccountInfo
                    data={item}
                    key={item.accountId}
                  />
                ))}
              </Masonry>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AccountInfo({ data }: { data: VBucksInformationData }) {
  const { account, details, total } = useParseAccountInfo({ data })

  return (
    <div className="border rounded">
      <header className="bg-muted-foreground/5 px-2 py-2">
        <div className="max-w-36 mx-auto text-center text-sm truncate">
          {parseCustomDisplayName(account)}
        </div>
        <div className="flex font-bold gap-1 items-center justify-center text-2xl">
          <figure className="relative top-0.5">
            <img
              src={vbucksImageUrl}
              className="size-5"
              alt="vbucks"
            />
          </figure>
          {numberWithCommaSeparator(total)}
        </div>
      </header>
      {details.length > 0 && (
        <div className="px-1.5 py-1.5 text-muted-foreground text-sm">
          <ul className="list-disc pl-6">
            {details.map(([templateId, currency]) => (
              <li
                className="leading-5"
                key={templateId}
              >
                <div>
                  {currency.platform} {currency.template}:{' '}
                  <span className="font-bold">
                    {numberWithCommaSeparator(currency.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
