import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
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

import { parseCustomDisplayName } from '../../../lib/utils'

import { useDailyQuestsData } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/daily-quests',
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
                {t('stw-operations.options.daily-quests')}
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
  const { t } = useTranslation(['stw-operations', 'general'])

  const {
    accounts,
    accountList,
    dailyQuests,
    fetchButtonIsDisabled,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    rerollIsDisabled,
    rerollingQuest,
    tags,

    dailyQuestsUpdateAccounts,
    dailyQuestsUpdateTags,
    handleFetch,
    handleReroll,
  } = useDailyQuestsData()

  return (
    <div className="flex flex-grow">
      <div className="flex items-center justify-center w-full">
        <div className="max-w-2xl space-y-4 w-full">
          <Card className="w-full">
            <CardHeader className="border-b">
              <CardDescription>
                {t('daily-quests.description')}
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
                onUpdateAccounts={dailyQuestsUpdateAccounts}
                onUpdateTags={dailyQuestsUpdateTags}
              />
            </CardContent>
            <CardFooter className="space-x-6">
              <Button
                className="w-full"
                onClick={handleFetch}
                disabled={fetchButtonIsDisabled}
              >
                {isLoading ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  t('daily-quests.form.submit-button')
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="w-full">
            <CardHeader className="border-b">
              <CardDescription>
                {t('daily-quests.list.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {dailyQuests.length <= 0 ? (
                <div className="text-sm text-muted-foreground">
                  {t('daily-quests.list.empty')}
                </div>
              ) : (
                <div className="space-y-6">
                  {dailyQuests.map((account) => {
                    const accountData = accountList[account.accountId]
                    const displayName = accountData
                      ? parseCustomDisplayName(accountData)
                      : account.accountId

                    return (
                      <div
                        key={account.accountId}
                        className="space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-semibold">
                            {displayName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t('daily-quests.list.rerolls', {
                              count: account.rerolls,
                            })}
                          </div>
                        </div>

                        {account.errorMessage ? (
                          <div className="border-l-4 border-red-400 ml-2 pl-2 text-red-400 text-sm">
                            {account.errorMessage}
                          </div>
                        ) : account.quests.length <= 0 ? (
                          <div className="text-sm text-muted-foreground">
                            {t('daily-quests.list.no-quests')}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {account.quests.map((quest) => {
                              const isRerolling =
                                rerollingQuest?.accountId ===
                                  account.accountId &&
                                rerollingQuest?.questId === quest.questId

                              return (
                                <div
                                  key={quest.questId}
                                  className="border rounded-md p-3 space-y-2"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                      <div className="font-medium truncate">
                                        {quest.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate">
                                        {quest.templateId}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      disabled={
                                        rerollIsDisabled ||
                                        account.rerolls <= 0
                                      }
                                      onClick={() =>
                                        handleReroll(
                                          account.accountId,
                                          quest.questId
                                        )
                                      }
                                    >
                                      {isRerolling ? (
                                        <UpdateIcon className="animate-spin" />
                                      ) : (
                                        t(
                                          'daily-quests.form.replace-button'
                                        )
                                      )}
                                    </Button>
                                  </div>

                                  <div className="text-xs text-muted-foreground">
                                    {t('daily-quests.list.state', {
                                      state: quest.state,
                                    })}
                                  </div>

                                  {quest.progress.length <= 0 ? (
                                    <div className="text-xs text-muted-foreground">
                                      {t('daily-quests.progress.empty')}
                                    </div>
                                  ) : (
                                    <div className="text-sm space-y-1">
                                      {quest.progress.map((item) => (
                                        <div
                                          key={`${quest.questId}-${item.key}`}
                                          className="flex items-center justify-between gap-4"
                                        >
                                          <span className="truncate">
                                            {item.label}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {item.value}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
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
    </div>
  )
}
