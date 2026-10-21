import type { DailyQuest } from '../../../types/daily-quests'

import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import dailyQuestsTotal from '../../../data/dailiy-quests.json'
import questRewards from '../../../data/quest-rewards.json'

import { Route as RootRoute } from '../../__root'

import { HomeBreadcrumb } from '../../../components/navigations/breadcrumb/home'
import { AccountSelectors } from '../../../components/selectors/accounts'
import { GoToTop } from '../../../components/go-to-top'
import { RewardIcon } from '../../../components/reward-icon'
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
import { Switch } from '../../../components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip'

import { parseResource } from '../../../lib/parsers/resources'
import { buildSettingsSnapshot } from '../../../lib/settings/snapshot'
import { cn, parseCustomDisplayName } from '../../../lib/utils'
import { useSettingsStore } from '../../../state/settings/main'

import { useDailyQuestsData } from './-hooks'

const QUEST_TOTALS = dailyQuestsTotal as Record<string, number>
const QUEST_REWARDS = questRewards as unknown as Record<
  string,
  Array<{
    quantity: number
    questTemplateId: string
    templateId: string
  }>
>

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

        <Tabs
          defaultValue="quests"
          className="flex flex-grow flex-col"
        >
          <div className="flex justify-center px-2">
            <TabsList>
              <TabsTrigger value="quests">
                {t('stw-operations.options.daily-quests')}
              </TabsTrigger>
              <TabsTrigger value="auto">
                {t('stw-operations.options.auto-daily-quests')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="quests"
            className="mt-4 flex-grow"
          >
            <Content />
          </TabsContent>
          <TabsContent
            value="auto"
            className="mt-4 flex-grow"
          >
            <AutoDailyQuestsContent />
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
    <TooltipProvider delayDuration={0}>
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
                onUpdateAccounts={dailyQuestsUpdateAccounts}
                onUpdateTags={dailyQuestsUpdateTags}
              />
              <Button
                className="shrink-0"
                onClick={handleFetch}
                disabled={fetchButtonIsDisabled}
                id="load-dailies-button"
              >
                {isLoading ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  t('daily-quests.form.submit-button')
                )}
              </Button>
            </div>

            <Card className="w-full">
              <CardContent className="p-0">
                {dailyQuests.length <= 0 ? (
                  <div className="px-4 py-5 text-sm text-muted-foreground">
                    {t('daily-quests.list.empty')}
                  </div>
                ) : (
                  <div className="divide-y">
                    {dailyQuests.map((account) => {
                      const accountData = accountList[account.accountId]
                      const displayName = accountData
                        ? parseCustomDisplayName(accountData)
                        : account.accountId

                      return (
                        <div key={account.accountId}>
                          <div className="flex items-center gap-2 px-3 py-2">
                            <div className="text-base font-semibold text-[#e9c4cc]">
                              {displayName}
                            </div>
                            <Badge
                              variant="secondary"
                              className="font-medium text-[11px]"
                            >
                              {t('daily-quests.list.rerolls', {
                                count: account.rerolls,
                              })}
                            </Badge>
                          </div>

                          {account.errorMessage ? (
                            <div className="border-l-4 border-red-400 mx-3 mb-3 pl-2 text-red-400 text-sm">
                              {account.errorMessage}
                            </div>
                          ) : account.quests.length <= 0 ? (
                            <div className="px-3 pb-3 text-sm text-muted-foreground">
                              {t('daily-quests.list.no-quests')}
                            </div>
                          ) : (
                            <div className="divide-y">
                              {account.quests.map((quest) => (
                                <QuestRow
                                  key={quest.questId}
                                  quest={quest}
                                  isRerolling={
                                    rerollingQuest?.accountId ===
                                      account.accountId &&
                                    rerollingQuest?.questId ===
                                      quest.questId
                                  }
                                  replaceDisabled={
                                    rerollIsDisabled ||
                                    account.rerolls <= 0
                                  }
                                  onReplace={() =>
                                    handleReroll(
                                      account.accountId,
                                      quest.questId,
                                    )
                                  }
                                />
                              ))}
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

      <GoToTop containerId="load-dailies-button" />
    </TooltipProvider>
  )
}

function AutoDailyQuestsContent() {
  const { t } = useTranslation(['stw-operations'])
  const settings = useSettingsStore()
  const autoDailyQuests = settings.autoDailyQuests

  const handleChange = (checked: boolean) => {
    const updated = buildSettingsSnapshot(settings, {
      autoDailyQuests: checked,
    })

    settings.updateSettings(updated)
    window.electronAPI.updateSettings(updated)
  }

  return (
    <div className="flex flex-grow">
      <div className="flex items-start justify-center w-full">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="pr-5">
                {t('daily-quests.form.auto-daily-quests')}
              </span>
              <Switch
                onCheckedChange={handleChange}
                checked={autoDailyQuests}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuestRow({
  quest,
  isRerolling,
  replaceDisabled,
  onReplace,
}: {
  quest: DailyQuest
  isRerolling: boolean
  replaceDisabled: boolean
  onReplace: () => void
}) {
  const { t } = useTranslation(['stw-operations'])

  const questId = quest.templateId.replace('Quest:', '')
  const questTotal = QUEST_TOTALS[questId]
  const percent =
    questTotal && questTotal > 0
      ? Math.min((quest.progress / questTotal) * 100, 100)
      : 0
  const isDone = questTotal > 0 && quest.progress >= questTotal
  const questName = t(`daily-quests.quests.${questId}`, {
    defaultValue: quest.name,
  })
  const rewards = (QUEST_REWARDS[quest.templateId] ?? []).filter(
    (reward) => reward.templateId.startsWith('AccountResource:'),
  )
  const replaceLabel = t('daily-quests.form.replace-button')

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="w-56 shrink-0 truncate text-sm">{questName}</div>

      <div className="min-w-0 flex-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full',
              isDone ? 'bg-emerald-400' : 'bg-violet-400',
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {questTotal != null
            ? `${quest.progress}/${questTotal}`
            : quest.progress}
        </div>
      </div>

      <ul className="flex shrink-0 gap-2">
        {rewards.map((reward) => {
          const resource = parseResource({
            key: reward.templateId,
            quantity: reward.quantity,
          })

          return (
            <li
              className="flex items-center gap-1 text-xs"
              key={reward.templateId}
            >
              <RewardIcon
                src={resource.imgUrl}
                fallback={resource.fallbackUrl}
                className="size-4"
                alt=""
                title={resource.name}
              />
              {resource.quantity}
            </li>
          )
        })}
      </ul>

      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex shrink-0">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              disabled={replaceDisabled}
              onClick={onReplace}
              aria-label={replaceLabel}
            >
              {isRerolling ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{replaceLabel}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
