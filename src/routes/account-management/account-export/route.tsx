import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { AccountSelectors } from '../../../components/selectors/accounts'
import { GoToTop } from '../../../components/go-to-top'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'

import { useGetAccounts } from '../../../hooks/accounts'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

import { useAccountExportPage } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/account-management/account-export',
  component: () => {
    const { t } = useTranslation(['sidebar'], {
      keyPrefix: 'account-management',
    })

    return (
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <HomeBreadcrumb />
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('options.account-export')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['account-management', 'general'])
  const { accountList } = useGetAccounts()
  const {
    accounts,
    exportIsDisabled,
    handleExport,
    isExporting,
    parsedSelectedAccounts,
    parsedSelectedTags,
    results,
    tags,
    accountExportUpdateAccounts,
    accountExportUpdateTags,
  } = useAccountExportPage()

  return (
    <>
      <div className="flex flex-grow mb-10">
        <div className="flex items-start justify-center w-full">
          <div className="max-w-4xl space-y-3 w-full">
            <p className="text-sm text-muted-foreground">
              {t('account-export.description')}
            </p>

            <div className="flex items-center gap-2 rounded-lg border p-2">
              <AccountSelectors
                layout="row"
                accountsPlaceholder={t('form.accounts.select', {
                  ns: 'general',
                })}
                accounts={{
                  options: accounts,
                  value: parsedSelectedAccounts,
                }}
                tags={{
                  options: tags,
                  value: parsedSelectedTags,
                }}
                onUpdateAccounts={accountExportUpdateAccounts}
                onUpdateTags={accountExportUpdateTags}
              />
              <Button
                className="h-8 shrink-0 px-3"
                id="account-export-button"
                size="sm"
                onClick={handleExport}
                disabled={exportIsDisabled}
              >
                {isExporting ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  t('account-export.submit')
                )}
              </Button>
            </div>

            {results.length <= 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('account-export.empty')}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {results.map((account) => {
                  const accountData = accountList[account.accountId]
                  const displayName = accountData
                    ? parseCustomDisplayName(accountData)
                    : account.accountId

                  return (
                    <div
                      key={account.accountId}
                      className="min-w-0 rounded-md border bg-background/40 px-2 py-1.5"
                    >
                      <div className="flex min-w-0 items-center gap-1.5">
                        {account.ok ? (
                          <Check className="size-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <X className="size-3.5 shrink-0 text-red-400" />
                        )}
                        <div className="min-w-0 truncate text-sm font-semibold text-[#e9c4cc]">
                          {displayName}
                        </div>
                        {account.ok ? (
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-emerald-500/20 font-medium text-[11px] text-emerald-300"
                          >
                            {t('account-export.done', {
                              done: 1,
                              total: 1,
                            })}
                          </Badge>
                        ) : null}
                      </div>
                      {account.errorMessage ? (
                        <div className="border-l-4 border-red-400 mt-1 pl-2 text-red-400 text-xs">
                          {account.errorMessage}
                        </div>
                      ) : account.path ? (
                        <div
                          className={cn(
                            'mt-1 truncate text-xs text-muted-foreground',
                          )}
                          title={account.path}
                        >
                          {account.path}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <GoToTop containerId="account-export-button" />
    </>
  )
}
