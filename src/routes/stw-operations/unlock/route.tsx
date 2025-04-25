import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
import { GoToTop } from '../../../components/go-to-top'

import { useUnlockData } from './-hooks'

import { cn, parseCustomDisplayName } from '../../../lib/utils'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/unlock',
  component: () => {
    const { t } = useTranslation(['sidebar'])

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
                {t('stw-operations.options.unlock')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['stw-operations'])

  const {
    accounts,
    currentStatuses,
    data,
    isDisabledForm,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    clearFormData,
    handleSave,
    unlockUpdateAccounts,
    unlockUpdateTags,
  } = useUnlockData()

  return (
    <>
      <div className="flex flex-grow">
        <div className="flex flex-col gap-5 items-center justify-center w-full">
          <Card className="max-w-lg w-full">
            <CardHeader
              className="border-b"
              id="ssd-card-header"
            >
              <CardDescription>{t('unlock.description')}</CardDescription>
              <CardDescription className="border-l-4 pl-2">
                {t('unlock.note')}
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
                onUpdateAccounts={unlockUpdateAccounts}
                onUpdateTags={unlockUpdateTags}
              />
            </CardContent>
            <CardFooter className="space-x-6">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={isDisabledForm}
              >
                {t('unlock.form.submit-button')}
              </Button>
              <Button
                className="w-full"
                onClick={clearFormData}
                disabled={data.length <= 0}
              >
                {t('unlock.form.clear-button')}
              </Button>
            </CardFooter>
          </Card>

          {data.length > 0 && (
            <section className="flex flex-col gap-2 max-w-lg mb-10 w-full">
              {data.map((account) => {
                const currentStatus = currentStatuses[account.accountId]

                return (
                  <article
                    className="border rounded w-full"
                    key={account.accountId}
                  >
                    <div className="bg-muted-foreground/5 flex items-center min-h-10 px-1 py-0.5 text-center text-muted-foreground text-xs">
                      <span className="px-1 truncate max-w-28">
                        {parseCustomDisplayName(account)}
                      </span>
                      {currentStatus !== undefined && (
                        <div className="flex gap-3 items-center ml-auto">
                          <div
                            className={cn(
                              'flex items-center justify-center size-8',
                              {
                                'text-green-600': currentStatus.status,
                                'text-[#ff6868]':
                                  currentStatus.status === false,
                              }
                            )}
                          >
                            {currentStatus.status === null ? (
                              <UpdateIcon className="animate-spin" />
                            ) : currentStatus.status ? (
                              <Check size={16} />
                            ) : (
                              <X size={16} />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </section>
          )}
        </div>
      </div>

      <GoToTop containerId="ssd-card-header" />
    </>
  )
}
