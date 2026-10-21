import type { AccountInfoItem, AccountInfoXp } from '../../../types/account-info'
import type { VentureQuest, VentureTrack } from '../../../lib/stw/ventures'

import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../../components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'

import {
  BR_XP_RESET_WEEKDAY,
  STW_XP_RESET_WEEKDAY,
  inspectRows,
  rarityBorderClass,
} from '../../../lib/stw/account-info'
import { getDateWithFormat, nextWeekdayDate } from '../../../lib/dates'
import { CATEGORY_LABEL, emptyVentureTrack } from '../../../lib/stw/ventures'
import {
  compactNumber,
  numberWithCommaSeparator,
} from '../../../lib/parsers/numbers'
import { assets } from '../../../lib/repository'
import { PERK_PIP_COLOR } from '../../../lib/stw/dq-weapons'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

import { useAccountInfoPage } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/account-info',
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
                {t('stw-operations.options.account-info')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Content />
      </>
    )
  },
})

function StwIcon({
  src,
  fallback,
  className,
}: {
  src: string
  fallback: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const url = failed ? fallback : src

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!url) {
    return null
  }

  return (
    <img
      src={url}
      alt=""
      className={cn('pointer-events-none object-contain', className)}
      onError={() => {
        if (!failed && fallback && fallback !== src) {
          setFailed(true)
        }
      }}
    />
  )
}

function ItemTile({
  item,
  selected,
  onSelect,
}: {
  item: AccountInfoItem
  selected: boolean
  onSelect: () => void
}) {
  const showPower = item.power > 0 && item.kind !== 'resource'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative aspect-square overflow-hidden rounded-lg border-2',
        rarityBorderClass(item.rarity),
        selected && 'outline outline-2 outline-offset-1 outline-white'
      )}
      title={`${item.name} · ${item.quantity}`}
    >
      <StwIcon
        src={item.imageUrl}
        fallback={item.fallbackUrl}
        className="absolute left-1/2 top-[42%] h-[68%] w-[72%] -translate-x-1/2 -translate-y-1/2 drop-shadow"
      />
      {item.quantity > 1 || item.kind === 'resource' ? (
        <span className="absolute bottom-0.5 left-1 text-[11px] font-extrabold text-white drop-shadow">
          {compactNumber(item.quantity)}
        </span>
      ) : null}
      {showPower ? (
        <span className="absolute bottom-0.5 right-1 text-[11px] font-extrabold text-white drop-shadow">
          {item.power}
        </span>
      ) : null}
    </button>
  )
}

function InspectDialog({
  item,
  onClose,
}: {
  item: AccountInfoItem
  onClose: () => void
}) {
  const { t } = useTranslation(['stw-operations'])
  const inspect = inspectRows(item)
  const stats: Array<string> = []

  if (item.level > 0) {
    stats.push(t('account-info.inspect.level', { level: item.level }))
  }

  if (item.quantity > 0) {
    stats.push(t('account-info.inspect.quantity', { count: item.quantity }))
  }

  if (item.durability > 0 || item.maxDurability > 0) {
    stats.push(
      t('account-info.inspect.durability', {
        current: Math.round(item.durability),
        max: Math.round(item.maxDurability || item.durability),
      })
    )
  }

  if (item.loadedAmmo !== null) {
    stats.push(t('account-info.inspect.ammo', { count: item.loadedAmmo }))
  }

  if (item.favorite) {
    stats.push(t('account-info.inspect.favorite'))
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="max-w-3xl overflow-hidden border-amber-900/60 bg-[#14110e] p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        <DialogDescription className="sr-only">{item.meta}</DialogDescription>
        <div className="flex max-h-[80vh]">
          <div className="w-44 shrink-0 bg-gradient-to-b from-amber-950/40 to-transparent p-3">
            <StwIcon
              key={item.itemId}
              src={item.imageUrl}
              fallback={item.fallbackUrl}
              className="mb-2 h-16 w-16"
            />
            <div className="text-sm font-extrabold text-orange-500">
              {item.name}
            </div>
            <div className="text-[11px] text-amber-300">{item.meta}</div>
            {item.power > 0 ? (
              <div className="mt-1 text-xl font-extrabold text-orange-400">
                {t('account-info.inspect.power', {
                  power: item.power,
                })}
              </div>
            ) : null}
            <div className="mt-2 space-y-0.5 text-[11px] text-stone-300">
              {stats.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1 overflow-y-auto px-3 py-2">
            {inspect.length > 0 ? (
              inspect.map((perk, index) => (
                <div
                  key={`${item.itemId}-${index}-${perk.id}`}
                  className="flex items-center gap-2 border-t border-white/10 py-1 text-xs first:border-t-0"
                >
                  <span className="flex w-2.5 flex-col gap-px">
                    {Array.from({ length: 5 }).map((_, pip) => (
                      <i
                        key={pip}
                        className={cn(
                          'block h-0.5 rounded-sm',
                          pip < perk.filled
                            ? PERK_PIP_COLOR[perk.rarity ?? 'sr']
                            : 'bg-zinc-700'
                        )}
                      />
                    ))}
                  </span>
                  <span>{perk.label}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">
                {t('account-info.inspect.no-perks')}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function questStateLabel(state: VentureQuest['state']) {
  if (state === 'active') {
    return 'quest-active'
  }

  if (state === 'completed') {
    return 'quest-completed'
  }

  if (state === 'claimed') {
    return 'quest-claimed'
  }

  return 'quest-locked'
}

function VenturesTrackPanel({ track }: { track: VentureTrack }) {
  const { t } = useTranslation(['stw-operations'])
  const span = Math.max(1, track.xpForNext - track.xpForLevel)
  const percent = Math.min(
    100,
    Math.max(0, ((track.xp - track.xpForLevel) / span) * 100)
  )
  const nextReward = track.rewards.find((reward) => !reward.claimed)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
        <div className="min-w-[4.5rem] text-center">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {t('account-info.ventures.level', { level: track.level })}
          </div>
          <div className="text-4xl font-extrabold text-amber-400">
            {track.level}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {t('account-info.ventures.xp', {
              current: numberWithCommaSeparator(track.xp),
              next: numberWithCommaSeparator(track.xpForNext),
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <div className="text-sm font-semibold">
            {t('account-info.ventures.rewards')}
          </div>
          <div className="max-h-[28rem] space-y-1 overflow-y-auto pr-1">
            {track.rewards.map((reward) => {
              const isNext = nextReward?.level === reward.level

              return (
                <div
                  key={reward.level}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-2 py-1.5',
                    reward.claimed && 'opacity-50',
                    isNext && 'border-amber-400/70 bg-amber-950/30'
                  )}
                >
                  <span className="w-8 shrink-0 text-center text-xs font-bold text-muted-foreground">
                    {reward.level}
                  </span>
                  <img
                    src={reward.imageUrl}
                    alt=""
                    className="pointer-events-none h-8 w-8 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold">
                      {reward.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      x{reward.quantity}
                    </div>
                  </div>
                  <Badge
                    variant={reward.claimed ? 'secondary' : 'outline'}
                    className="h-5 shrink-0 px-1.5 text-[10px]"
                  >
                    {reward.claimed
                      ? t('account-info.ventures.claimed')
                      : isNext
                        ? t('account-info.ventures.next')
                        : t('account-info.ventures.upcoming')}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-sm font-semibold">
            {t('account-info.ventures.quests')}
          </div>
          {track.quests.length <= 0 ? (
            <div className="text-sm text-muted-foreground">
              {t('account-info.ventures.quests-empty')}
            </div>
          ) : (
            <div className="max-h-[28rem] space-y-1 overflow-y-auto pr-1">
              {track.quests.map((quest) => {
                const goal = Math.max(quest.goal, 1)
                const percentDone = Math.min(
                  100,
                  Math.max(0, (quest.progress / goal) * 100)
                )
                const done =
                  quest.state === 'claimed' ||
                  quest.state === 'completed' ||
                  quest.progress >= goal

                return (
                  <div
                    key={quest.itemId}
                    className={cn(
                      'rounded-lg border px-2 py-1.5',
                      quest.state === 'claimed' && 'opacity-50',
                      quest.state === 'active' && 'border-amber-400/40'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold">
                          {quest.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {CATEGORY_LABEL[quest.category] ?? quest.category}
                        </div>
                      </div>
                      <Badge
                        variant={
                          quest.state === 'active' ? 'default' : 'secondary'
                        }
                        className="h-5 shrink-0 px-1.5 text-[10px]"
                      >
                        {t(
                          `account-info.ventures.${questStateLabel(quest.state)}`
                        )}
                      </Badge>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          done ? 'bg-emerald-400' : 'bg-amber-400'
                        )}
                        style={{ width: `${percentDone}%` }}
                      />
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {t('account-info.ventures.progress', {
                        progress: quest.progress,
                        goal,
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function XpMeter({
  label,
  current,
  cap,
}: {
  label: string
  current: number
  cap: number
}) {
  const { t } = useTranslation(['stw-operations'])
  const percent = cap > 0 ? Math.min(100, (current / cap) * 100) : 0

  return (
    <div>
      <div className="text-xs font-semibold">{label}</div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-sky-400"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        {t('account-info.xp.progress', {
          current: numberWithCommaSeparator(current),
          cap: numberWithCommaSeparator(cap),
        })}
      </div>
    </div>
  )
}

function BattlePassXpCard({ xp }: { xp: AccountInfoXp }) {
  const { t } = useTranslation(['stw-operations'])
  const level = (
    xp.xpPerLevel > 0 ? xp.level + xp.levelXp / xp.xpPerLevel : xp.level
  ).toFixed(1)
  const brReset = getDateWithFormat(
    nextWeekdayDate(BR_XP_RESET_WEEKDAY),
    'DD.MM.YYYY'
  )
  const stwReset = getDateWithFormat(
    nextWeekdayDate(STW_XP_RESET_WEEKDAY),
    'DD.MM.YYYY'
  )

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
      <div className="text-sm font-semibold">
        {t('account-info.xp.level', { level })}
      </div>
      <XpMeter
        label={t('account-info.xp.br')}
        current={xp.br.current}
        cap={xp.br.cap}
      />
      <XpMeter
        label={t('account-info.xp.creative')}
        current={xp.creative.current}
        cap={xp.creative.cap}
      />
      <div className="text-[11px] text-muted-foreground">
        {t('account-info.xp.resets', { date: brReset })}
      </div>
      <XpMeter
        label={t('account-info.xp.stw')}
        current={xp.stw.current}
        cap={xp.stw.cap}
      />
      <div className="text-[11px] text-muted-foreground">
        {t('account-info.xp.resets', { date: stwReset })}
      </div>
    </div>
  )
}

function Content() {
  const { t } = useTranslation(['stw-operations', 'general'])
  const {
    accounts,
    accountList,
    results,
    current,
    inventoryItems,
    inventoryTab,
    filter,
    combineStacks,
    selectedItem,
    viewAccountId,
    fetchButtonIsDisabled,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    accountInfoUpdateAccounts,
    accountInfoUpdateTags,
    handleFetch,
    setFilter,
    setCombineStacks,
    setInventoryTab,
    setSelectedItem,
    setViewAccountId,
  } = useAccountInfoPage()

  return (
    <div className="mb-10 flex flex-grow">
      <div className="flex w-full items-start justify-center">
        <div className="w-full max-w-4xl space-y-3">
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
              onUpdateAccounts={accountInfoUpdateAccounts}
              onUpdateTags={accountInfoUpdateTags}
            />
            <Button
              id="load-account-info-button"
              className="shrink-0"
              onClick={handleFetch}
              disabled={fetchButtonIsDisabled}
            >
              {isLoading ? (
                <UpdateIcon className="animate-spin" />
              ) : (
                t('account-info.form.submit-button')
              )}
            </Button>
          </div>

          {results.length > 1 ? (
            <div className="flex flex-wrap gap-1.5">
              {results.map((result) => {
                const account = accountList[result.accountId]
                const name = account
                  ? parseCustomDisplayName(account)
                  : result.accountId

                return (
                  <Button
                    key={result.accountId}
                    size="sm"
                    variant={
                      result.accountId === viewAccountId
                        ? 'default'
                        : 'outline'
                    }
                    className="h-7 px-2 text-xs"
                    onClick={() => setViewAccountId(result.accountId)}
                  >
                    {name}
                  </Button>
                )
              })}
            </div>
          ) : null}

          {!current ? (
            <Card>
              <CardContent className="px-4 py-5 text-sm text-muted-foreground">
                {t('account-info.list.empty')}
              </CardContent>
            </Card>
          ) : !current.available ? (
            <Card>
              <CardContent className="px-4 py-5 text-sm text-muted-foreground">
                {t('account-info.list.unavailable')}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
            <BattlePassXpCard xp={current.xp} />
            <Tabs
              defaultValue="resources"
              className="flex flex-col"
              onValueChange={(value) => {
                if (value === 'backpack' || value === 'storage') {
                  setInventoryTab(value)
                } else if (value === 'ventures-inventory') {
                  setInventoryTab('ventures')
                }
              }}
            >
              <TabsList className="mx-auto h-auto min-h-10 flex-wrap">
                <TabsTrigger
                  value="resources"
                  className="px-2.5"
                >
                  {t('account-info.tabs.resources')}
                </TabsTrigger>
                <TabsTrigger
                  value="backpack"
                  className="px-2.5"
                >
                  {t('account-info.tabs.backpack')}
                </TabsTrigger>
                <TabsTrigger
                  value="storage"
                  className="px-2.5"
                >
                  {t('account-info.tabs.storage')}
                </TabsTrigger>
                <TabsTrigger
                  value="ventures-inventory"
                  className="px-2.5"
                >
                  {t('account-info.tabs.ventures-inventory')}
                </TabsTrigger>
                <TabsTrigger
                  value="ventures"
                  className="px-2.5"
                >
                  {t('account-info.tabs.ventures')}
                </TabsTrigger>
                <TabsTrigger
                  value="commander"
                  className="px-2.5"
                >
                  {t('account-info.tabs.commander')}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="resources"
                className="mt-3"
              >
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {current.resources.map((resource) => (
                    <div
                      key={resource.templateId}
                      className="flex min-w-0 flex-col gap-1"
                    >
                      <div
                        className={cn(
                          'relative aspect-square overflow-hidden rounded-lg border-2',
                          rarityBorderClass(resource.rarity)
                        )}
                      >
                        <StwIcon
                          src={resource.imageUrl}
                          fallback={resource.fallbackUrl || resource.imageUrl}
                          className="absolute left-1/2 top-[42%] h-[70%] w-[72%] -translate-x-1/2 -translate-y-1/2"
                        />
                        <span className="absolute bottom-0.5 right-1 text-[11px] font-extrabold text-white drop-shadow">
                          {compactNumber(resource.quantity)}
                        </span>
                      </div>
                      <div className="truncate text-center text-[10px] text-muted-foreground">
                        {resource.name}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {(
                [
                  { value: 'backpack', key: 'backpack' },
                  { value: 'storage', key: 'storage' },
                  { value: 'ventures-inventory', key: 'ventures' },
                ] as const
              ).map((tab) => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="mt-3 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold">
                      {t(`account-info.tabs.${tab.value}`)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(
                        ['all', 'weapon', 'trap', 'resource'] as const
                      ).map((key) => (
                        <Button
                          key={key}
                          size="sm"
                          variant={filter === key ? 'default' : 'outline'}
                          className="h-7 px-2 text-xs"
                          onClick={() => setFilter(key)}
                        >
                          {t(`account-info.filters.${key}`)}
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        variant={combineStacks ? 'default' : 'outline'}
                        className="h-7 px-2 text-xs"
                        onClick={() => setCombineStacks((value) => !value)}
                      >
                        {combineStacks
                          ? t('account-info.filters.separate-stacks')
                          : t('account-info.filters.combine-stacks')}
                      </Button>
                    </div>
                  </div>
                  {inventoryTab === tab.key && inventoryItems.length <= 0 ? (
                    <div className="text-sm text-muted-foreground">
                      {t('account-info.list.inventory-empty')}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
                    {inventoryTab === tab.key
                      ? inventoryItems.map((item) => (
                          <ItemTile
                            key={item.itemId}
                            item={item}
                            selected={selectedItem?.itemId === item.itemId}
                            onSelect={() => setSelectedItem(item)}
                          />
                        ))
                      : null}
                  </div>
                </TabsContent>
              ))}

              <TabsContent
                value="ventures"
                className="mt-3"
              >
                <VenturesTrackPanel
                  track={current.venturesTrack ?? emptyVentureTrack()}
                />
              </TabsContent>

              <TabsContent
                value="commander"
                className="mt-3 space-y-3"
              >
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border bg-muted/20 p-3 text-center">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {t('account-info.commander.base')}
                    </div>
                    <div className="text-4xl font-extrabold text-amber-400">
                      {current.commander.baseLevel}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('account-info.commander.cap')}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3 text-center">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {t('account-info.commander.pcl')}
                    </div>
                    <div className="text-4xl font-extrabold text-amber-400">
                      {current.commander.postLevel}
                    </div>
                    <div className="text-xs text-muted-foreground">PCL</div>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-3 text-center">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {t('account-info.commander.overall')}
                    </div>
                    <div className="text-4xl font-extrabold text-amber-400">
                      {current.commander.total}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      310 + PCL
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                    <img
                      src={assets('smallxpboost')}
                      alt=""
                      className="pointer-events-none h-10 w-10 object-contain"
                    />
                    <div>
                      <div className="font-bold">
                        {t('account-info.commander.boosts-applied', {
                          count: current.xpBoosts.applied,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('account-info.commander.boosts-applied-label')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                    <img
                      src={assets('smallxpboost')}
                      alt=""
                      className="pointer-events-none h-10 w-10 object-contain"
                    />
                    <div>
                      <div className="font-bold">
                        {t('account-info.commander.boosts-xp', {
                          xp: numberWithCommaSeparator(
                            current.xpBoosts.boostedXP
                          ),
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('account-info.commander.boosts-xp-label')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                    <img
                      src={assets('smallxpboost')}
                      alt=""
                      className="pointer-events-none h-10 w-10 object-contain"
                    />
                    <div>
                      <div className="font-bold">
                        {t('account-info.commander.boosts-left', {
                          count: current.xpBoosts.personal,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('account-info.commander.boosts-personal')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                    <img
                      src={assets('smallxpboost_gift')}
                      alt=""
                      className="pointer-events-none h-10 w-10 object-contain"
                    />
                    <div>
                      <div className="font-bold">
                        {t('account-info.commander.boosts-left', {
                          count: current.xpBoosts.teammate,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('account-info.commander.boosts-teammate')}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('account-info.commander.note')}
                </p>
              </TabsContent>
            </Tabs>
            </div>
          )}
        </div>
      </div>
      {selectedItem ? (
        <InspectDialog
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
      <GoToTop containerId="load-account-info-button" />
    </div>
  )
}
