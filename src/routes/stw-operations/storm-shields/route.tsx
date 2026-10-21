import type { StormShieldZoneProgress } from '../../../lib/stw/storm-shields'
import type { StormShieldsAccountData } from '../../../types/storm-shields'

import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
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
import { Card, CardContent } from '../../../components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'

import {
  SSD_MAX,
  STORM_SHIELD_ZONES,
} from '../../../lib/stw/storm-shields'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

import { Content as HomebaseNameContent } from '../homebase-name/route'
import { Content as UnlockContent } from '../unlock/route'
import { useStormShieldsPage } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/storm-shields',
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
                {t('stw-operations.options.storm-shields')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Tabs
          defaultValue="shields"
          className="flex flex-grow flex-col"
        >
          <div className="flex justify-center px-2">
            <TabsList>
              <TabsTrigger value="shields">
                {t('stw-operations.options.storm-shields')}
              </TabsTrigger>
              <TabsTrigger value="homebase">
                {t('stw-operations.options.homebase-name')}
              </TabsTrigger>
              <TabsTrigger value="unlock">
                {t('stw-operations.options.unlock')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="shields"
            className="mt-4 flex-grow"
          >
            <Content />
          </TabsContent>
          <TabsContent
            value="homebase"
            className="mt-4 flex-grow"
          >
            <HomebaseNameContent />
          </TabsContent>
          <TabsContent
            value="unlock"
            className="mt-4 flex-grow"
          >
            <UnlockContent />
          </TabsContent>
        </Tabs>
      </>
    )
  },
})

function Content() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const {
    accounts,
    accountList,
    results,
    fetchButtonIsDisabled,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    stormShieldsUpdateAccounts,
    stormShieldsUpdateTags,
    handleFetch,
  } = useStormShieldsPage()

  return (
    <div className="flex flex-grow mb-10">
      <div className="flex items-start justify-center w-full">
        <div className="max-w-4xl space-y-3 w-full">
          <div className="flex items-center gap-2 rounded-lg border p-2">
            <AccountSelectors
              layout="row"
              accounts={{
                options: accounts,
                value: parsedSelectedAccounts,
              }}
              tags={{
                options: tags,
                value: parsedSelectedTags,
              }}
              onUpdateAccounts={stormShieldsUpdateAccounts}
              onUpdateTags={stormShieldsUpdateTags}
            />
            <Button
              className="shrink-0"
              onClick={handleFetch}
              disabled={fetchButtonIsDisabled}
              id="load-storm-shields-button"
            >
              {isLoading ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                t('storm-shields.form.submit-button')
              )}
            </Button>
          </div>

          <Card className="w-full">
            <CardContent className="p-0">
              {results.length <= 0 ? (
                <div className="px-4 py-5 text-sm text-muted-foreground">
                  {t('storm-shields.list.empty')}
                </div>
              ) : (
                <div className="divide-y">
                  {results.map((account) => {
                    const accountData = accountList[account.accountId]
                    const displayName = accountData
                      ? parseCustomDisplayName(accountData)
                      : account.accountId

                    return (
                      <div
                        key={account.accountId}
                        className="px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-base font-semibold text-[#e9c4cc]">
                            {displayName}
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'font-medium text-[11px]',
                              account.complete &&
                                'bg-emerald-500/20 text-emerald-300'
                            )}
                          >
                            {t('storm-shields.list.ready', {
                              total: account.total,
                            })}
                          </Badge>
                        </div>

                        {account.errorMessage ? (
                          <div className="border-l-4 border-red-400 mt-2 pl-2 text-red-400 text-sm">
                            {account.errorMessage}
                          </div>
                        ) : (
                          <AccountZones account={account} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <GoToTop containerId="load-storm-shields-button" />
    </div>
  )
}

function AccountZones({ account }: { account: StormShieldsAccountData }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
      {STORM_SHIELD_ZONES.map((zone) => (
        <ZoneCell
          key={zone}
          progress={account.zones[zone]}
        />
      ))}
    </div>
  )
}

function ZoneCell({ progress }: { progress: StormShieldZoneProgress }) {
  const { t } = useTranslation(['stw-operations'])
  const done = progress.completed >= SSD_MAX
  const started = progress.completed > 0 || progress.next !== null
  const percent = Math.round((progress.completed / SSD_MAX) * 100)

  return (
    <div
      className={cn(
        'rounded-md border px-2 py-1.5',
        done
          ? 'border-emerald-500/30 bg-emerald-500/10'
          : started
            ? 'border-amber-500/25 bg-amber-500/5'
            : 'border-border text-muted-foreground'
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="truncate text-[11px] font-medium">
          {t(`storm-shields.zones.${progress.zone}`)}
        </div>
        {progress.endurance ? (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
            {t('storm-shields.endurance')}
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          'mt-0.5 text-sm font-semibold tabular-nums',
          done
            ? 'text-emerald-300'
            : started
              ? 'text-amber-200'
              : 'text-muted-foreground'
        )}
      >
        {t('storm-shields.ssd', {
          level: progress.completed,
          max: SSD_MAX,
        })}
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            'h-full rounded-full',
            done ? 'bg-emerald-400' : 'bg-amber-400'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
