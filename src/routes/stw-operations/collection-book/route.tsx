import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { BookOpen, ChevronRight, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
import { Switch } from '../../../components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'

import {
  COLLECTION_BOOK_NAV,
  RARITY_ORDER,
  levelCeiling,
  parseStarTier,
  rarityFromTemplate,
  sectionIdsFor,
} from '../../../config/constants/collection-book'
import { raritiesColor } from '../../../config/constants/resources'

import { useCollectionBookPage } from './-hooks'
import { useGetAccounts } from '../../../hooks/accounts'

import { images } from '../../../images'
import { itemIconUrl } from '../../../lib/stw/item-icons'
import { schematicIconUrl } from '../../../lib/stw/dq-weapons'
import { numberWithCommaSeparator } from '../../../lib/parsers/numbers'
import { parseResource } from '../../../lib/parsers/resources'
import { cn, parseCustomDisplayName } from '../../../lib/utils'
import { toast } from '../../../lib/notifications'
import {
  stwCatalogEntries,
  type StwNameEntry,
  type StwNameKind,
} from '../../../lib/stw/display-names'
import {
  addUpgradeSpend,
  emptyUpgradeSpend,
  upgradeSpend,
  type UpgradeSpend,
} from '../../../lib/stw/upgrade-cost'

import type {
  CollectionBookAccountData,
  CollectionBookCostKind,
  CollectionBookItem,
  CollectionBookResources,
  CollectionBookSectionId,
} from '../../../types/collection-book'

const LEVEL_CHOICES = [10, 20, 30, 40, 50, 60]

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/collection-book',
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
                {t('stw-operations.options.collection-book')}
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
    accountOptions,
    isDisabledForm,
    isLoading,
    isActing,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tagOptions,
    accountsData,
    lastResult,
    updateAccounts,
    updateTags,
    handleLoad,
    handleUpgradeSection,
    handleUpgradeItems,
    handleSlotItem,
  } = useCollectionBookPage()

  useEffect(() => {
    if (!lastResult) {
      return
    }

    if ((lastResult.slotted ?? 0) > 0) {
      toast(
        t('collection-book.toasts.slotted', {
          count: lastResult.slotted,
        }),
      )
      return
    }

    if ((lastResult.upgraded ?? 0) > 0) {
      toast(
        t('collection-book.toasts.upgraded', {
          count: lastResult.upgraded,
          failed: lastResult.failed ?? 0,
        }),
      )
      return
    }

    if (lastResult.error) {
      toast(
        t(`collection-book.toasts.error_${lastResult.error}`, {
          defaultValue: lastResult.error,
        }),
      )
    }
  }, [lastResult, t])

  return (
    <>
      <div className="flex flex-grow">
        <div className="flex flex-col gap-4 items-center w-full px-2">
          <Card className="max-w-5xl w-full shadow-sm" id="collection-book-card">
            <CardHeader className="border-b space-y-2">
              <CardTitle className="flex gap-2 items-center text-lg">
                <span className="bg-primary/10 flex p-1.5 rounded-md">
                  <BookOpen className="size-5 text-primary" />
                </span>
                {t('collection-book.title')}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {t('collection-book.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6">
              <AccountSelectors
                accounts={{
                  options: accountOptions,
                  value: parsedSelectedAccounts,
                }}
                tags={{
                  options: tagOptions,
                  value: parsedSelectedTags,
                }}
                onUpdateAccounts={updateAccounts}
                onUpdateTags={updateTags}
              />
            </CardContent>
            <CardFooter className="border-t bg-muted/20">
              <Button className="w-full" onClick={handleLoad} disabled={isDisabledForm}>
                {isLoading ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  <>
                    <BookOpen className="mr-2 size-4" />
                    {t('collection-book.form.load')}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {accountsData.length > 0 && (
            <div className="gap-4 grid max-w-5xl w-full">
              {accountsData.map((accountData) => (
                <AccountCollectionPanel
                  key={accountData.accountId}
                  data={accountData}
                  isActing={isActing}
                  onUpgradeItems={handleUpgradeItems}
                  onUpgradeSection={handleUpgradeSection}
                  onSlotItem={handleSlotItem}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <GoToTop containerId="collection-book-card" />
    </>
  )
}

function AccountCollectionPanel({
  data,
  isActing,
  onUpgradeItems,
  onUpgradeSection,
  onSlotItem,
}: {
  data: CollectionBookAccountData
  isActing: boolean
  onUpgradeItems: (accountId: string, itemIds: Array<string>, level: number) => void
  onUpgradeSection: (accountId: string, sectionId: string, level: number) => void
  onSlotItem: (accountId: string, itemId: string) => void
}) {
  const { t } = useTranslation(['stw-operations'])
  const { accountList } = useGetAccounts()
  const account = accountList[data.accountId]
  const [filter, setFilter] = useState('')
  const [hideMaxed, setHideMaxed] = useState(false)
  const [selected, setSelected] = useState('heroes-soldiers')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    heroes: true,
  })
  const [dialog, setDialog] = useState<UpgradeDialogState | null>(null)

  const resources = data.resources
  const bookItems = data.items.filter((item) => item.state === 'book')
  const armoryItems = data.items.filter((item) => item.state === 'armory')
  const belowMax = bookItems.filter((item) => item.level < item.maxLevel).length

  const toMax = useMemo(() => {
    const total = emptyUpgradeSpend()

    bookItems.forEach((item) => {
      addUpgradeSpend(
        total,
        upgradeSpend({
          costKind: item.costKind,
          rarity: item.rarity,
          level: item.level,
          maxLevel: item.maxLevel,
          targetLevel: item.maxLevel,
          starTier: item.starTier,
        }),
      )
    })

    return total
  }, [bookItems])

  const activeIds = sectionIdsFor(selected) ?? []
  const pageCards = usePageCards(data.items, activeIds, filter, hideMaxed)
  const groups = useMemo(() => groupCards(pageCards), [pageCards])

  const openUpgrade = (next: UpgradeDialogState) => {
    setDialog(next)
  }

  return (
    <Card className="w-full overflow-hidden shadow-sm">
      <CardHeader className="border-b bg-muted/30 space-y-3 pb-3">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <CardTitle className="text-base truncate">
            {parseCustomDisplayName(account)}
          </CardTitle>
          {data.error && (
            <Badge variant="destructive">
              {t(`collection-book.errors.${data.error}`, {
                defaultValue: data.error,
              })}
            </Badge>
          )}
        </div>
        <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
          <StatChip
            label={t('collection-book.stats.book', { count: bookItems.length })}
          />
          <StatChip
            label={t('collection-book.stats.armory', {
              count: armoryItems.length,
            })}
          />
          <StatChip
            label={t('collection-book.stats.below', { count: belowMax })}
            accent={belowMax > 0}
          />
          <StatChip
            label={t('collection-book.stats.cb-level', {
              level: data.collectionBookLevel,
            })}
          />
        </div>
        <SpendSummary
          title={t('collection-book.stats.to-max')}
          spend={toMax}
          have={resources}
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex min-h-[28rem]">
          <nav className="border-r w-40 shrink-0 overflow-y-auto max-h-[36rem] py-1">
            {COLLECTION_BOOK_NAV.map((group) => {
              const ids = sectionIdsFor(group.id) ?? []
              const count = data.items.filter(
                (item) => item.state === 'book' && ids.includes(item.sectionId),
              ).length
              const expanded = openGroups[group.id] === true
              const parentActive = selected === group.id

              return (
                <div key={group.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-1 px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide hover:bg-muted/70',
                      parentActive && 'bg-muted',
                    )}
                    onClick={() => {
                      setSelected(group.id)
                      if (group.children?.length) {
                        setOpenGroups((current) => ({
                          ...current,
                          [group.id]: !current[group.id],
                        }))
                      }
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault()
                      openUpgrade({
                        sectionId: group.id,
                        title: t(`collection-book.nav.${group.labelKey}`),
                        items: upgradableItems(data.items, ids),
                        level: 50,
                      })
                    }}
                  >
                    {group.children?.length ? (
                      <ChevronRight
                        className={cn(
                          'size-3 shrink-0 transition-transform',
                          expanded && 'rotate-90',
                        )}
                      />
                    ) : (
                      <span className="size-3 shrink-0" />
                    )}
                    <span className="truncate flex-1">
                      {t(`collection-book.nav.${group.labelKey}`)}
                    </span>
                    {count > 0 && (
                      <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium tabular-nums">
                        {count}
                      </span>
                    )}
                  </button>
                  {expanded &&
                    group.children?.map((child) => {
                      const childCount = data.items.filter(
                        (item) =>
                          item.state === 'book' && item.sectionId === child.id,
                      ).length
                      const active = selected === child.id

                      return (
                        <button
                          key={child.id}
                          type="button"
                          className={cn(
                            'flex w-full items-center gap-1 py-1 pl-6 pr-2 text-left text-xs hover:bg-muted/70',
                            active && 'bg-muted font-medium',
                          )}
                          onClick={() => setSelected(child.id)}
                          onContextMenu={(event) => {
                            event.preventDefault()
                            openUpgrade({
                              sectionId: child.id,
                              title: t(`collection-book.nav.${child.labelKey}`),
                              items: upgradableItems(data.items, [child.id]),
                              level: 50,
                            })
                          }}
                        >
                          <span className="truncate flex-1">
                            {t(`collection-book.nav.${child.labelKey}`)}
                          </span>
                          {childCount > 0 && (
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              {childCount}
                            </span>
                          )}
                        </button>
                      )
                    })}
                </div>
              )
            })}
          </nav>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b p-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('collection-book.form.filter')}
                  className="bg-background h-8 pl-8"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                />
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                <Switch checked={hideMaxed} onCheckedChange={setHideMaxed} />
                {t('collection-book.form.hide-maxed')}
              </label>
            </div>
            <div className="max-h-[32rem] overflow-y-auto p-2">
              {groups.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {t('collection-book.actions.empty')}
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {groups.map((group) => (
                    <div
                      key={group.name}
                      className="rounded-md border bg-muted/20"
                    >
                      <div className="truncate px-2 py-1 text-xs font-medium">
                        {group.name}
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-2 pt-0">
                        {group.cards.map((item) => (
                          <ItemCard
                            key={item.cardKey}
                            item={item}
                            showPath={group.showPath}
                            onOpen={() => {
                              if (item.state === 'missing' || !item.itemId) {
                                return
                              }

                              openUpgrade({
                                sectionId: null,
                                title: item.name,
                                items: [item],
                                level: suggestedLevel(item),
                              })
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <UpgradeDialog
        dialog={dialog}
        resources={resources}
        isActing={isActing}
        onClose={() => setDialog(null)}
        onLevel={(level) =>
          setDialog((current) => (current ? { ...current, level } : current))
        }
        onConfirm={() => {
          if (!dialog) return
          if (dialog.sectionId) {
            onUpgradeSection(data.accountId, dialog.sectionId, dialog.level)
          } else {
            onUpgradeItems(
              data.accountId,
              dialog.items.map((item) => item.itemId).filter(Boolean),
              dialog.level,
            )
          }
          setDialog(null)
        }}
        onSlot={() => {
          const item = dialog?.items[0]
          if (!item?.itemId || item.state !== 'armory') return
          onSlotItem(data.accountId, item.itemId)
          setDialog(null)
        }}
      />
    </Card>
  )
}

type UpgradeDialogState = {
  sectionId: string | null
  title: string
  items: Array<CollectionBookItem>
  level: number
}

function UpgradeDialog({
  dialog,
  resources,
  isActing,
  onClose,
  onLevel,
  onConfirm,
  onSlot,
}: {
  dialog: UpgradeDialogState | null
  resources: CollectionBookResources
  isActing: boolean
  onClose: () => void
  onLevel: (level: number) => void
  onConfirm: () => void
  onSlot: () => void
}) {
  const { t } = useTranslation(['stw-operations'])
  const spend = useMemo(() => {
    const total = emptyUpgradeSpend()

    dialog?.items.forEach((item) => {
      addUpgradeSpend(
        total,
        upgradeSpend({
          costKind: item.costKind,
          rarity: item.rarity,
          level: item.level,
          maxLevel: item.maxLevel,
          targetLevel: dialog.level,
          starTier: item.starTier,
        }),
      )
    })

    return total
  }, [dialog])

  const maxChoice = dialog
    ? Math.max(...dialog.items.map((item) => item.maxLevel), 10)
    : 50
  const single = dialog?.items.length === 1 ? dialog.items[0] : null

  return (
    <Dialog open={dialog !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="pr-6 text-base">{dialog?.title}</DialogTitle>
        </DialogHeader>
        {dialog && dialog.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('collection-book.upgrade.empty')}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {t('collection-book.upgrade.items', {
                count: dialog?.items.length ?? 0,
              })}
              {single
                ? ` · ${single.level}/${single.maxLevel}`
                : ''}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <Input
                type="number"
                min={1}
                max={60}
                className="h-8 w-16"
                value={dialog?.level ?? 50}
                onChange={(event) =>
                  onLevel(
                    Math.max(1, Math.min(maxChoice, Number(event.target.value) || 1)),
                  )
                }
              />
              {LEVEL_CHOICES.filter((level) => level <= maxChoice).map((level) => (
                <Button
                  key={level}
                  type="button"
                  size="sm"
                  variant={dialog?.level === level ? 'default' : 'outline'}
                  className="h-8 min-w-10 px-2"
                  onClick={() => onLevel(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium">
                {t('collection-book.upgrade.cost')}
              </p>
              <SpendList spend={spend} have={resources} />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          {single?.state === 'armory' && (
            <Button
              type="button"
              variant="outline"
              disabled={isActing}
              onClick={onSlot}
            >
              {t('collection-book.upgrade.slot')}
            </Button>
          )}
          <Button
            type="button"
            disabled={isActing || !dialog || dialog.items.length === 0}
            onClick={onConfirm}
          >
            {isActing ? (
              <UpdateIcon className="animate-spin" />
            ) : (
              t('collection-book.upgrade.confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const SPEND_ICON: Record<keyof UpgradeSpend, string> = {
  peopleXp: images.peoplexp,
  schematicXp: images.schematicxp,
  rain: images.reagent_c_t01,
  lightning: images.reagent_c_t02,
  eye: images.reagent_c_t03,
  shard: images.reagent_c_t04,
  trainingManuals: images.reagent_people,
  schematicManuals: images.reagent_schematic,
  heroSupercharger: images.reagent_promotion_heroes,
  survivorSupercharger: images.reagent_promotion_survivors,
  weaponSupercharger: images.reagent_promotion_weapons,
  trapSupercharger: images.reagent_promotion_traps,
}

function ResourceIcon({ id }: { id: keyof UpgradeSpend }) {
  return (
    <img src={SPEND_ICON[id]} alt="" className="size-4 shrink-0 object-contain" />
  )
}

function SpendSummary({
  title,
  spend,
  have,
}: {
  title: string
  spend: UpgradeSpend
  have: CollectionBookResources
}) {
  const { t } = useTranslation(['stw-operations'])
  const rows = spendRows(spend, have)

  if (rows.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-xs text-muted-foreground">{title}</span>
      {rows.map((row) => {
        const name = t(`collection-book.resources.${row.key}`)
        const hint =
          row.short > 0
            ? `${name} · ${t('collection-book.upgrade.short', {
                amount: numberWithCommaSeparator(row.short),
              })}`
            : name

        return (
        <span
          key={row.key}
          title={hint}
          className={cn(
            'inline-flex items-center gap-1 text-xs tabular-nums',
            row.short > 0 && 'text-amber-600 dark:text-amber-300',
          )}
        >
          <ResourceIcon id={row.key} />
          {numberWithCommaSeparator(row.cost)}
        </span>
        )
      })}
    </div>
  )
}

function SpendList({
  spend,
  have,
}: {
  spend: UpgradeSpend
  have: CollectionBookResources
}) {
  const { t } = useTranslation(['stw-operations'])
  const rows = spendRows(spend, have)

  if (rows.length === 0) {
    return <p className="text-xs text-muted-foreground">0</p>
  }

  return (
    <ul className="space-y-1 text-xs">
      {rows.map((row) => (
        <li key={row.key} className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5">
            <ResourceIcon id={row.key} />
            {t(`collection-book.resources.${row.key}`)}
          </span>
          <span className={cn(row.short > 0 && 'text-amber-600 dark:text-amber-300')}>
            {numberWithCommaSeparator(row.cost)}
            {row.short > 0
              ? ` · ${t('collection-book.upgrade.short', {
                  amount: numberWithCommaSeparator(row.short),
                })}`
              : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}

function spendRows(spend: UpgradeSpend, have: CollectionBookResources) {
  return (Object.keys(spend) as Array<keyof UpgradeSpend>)
    .filter((key) => spend[key] > 0)
    .map((key) => {
      const cost = spend[key]
      const owned = have?.[key] ?? 0

      return {
        key,
        cost,
        short: Math.max(0, cost - owned),
      }
    })
}

function ItemCard({
  item,
  showPath,
  onOpen,
}: {
  item: CollectionBookItem
  showPath: boolean
  onOpen: () => void
}) {
  const { t } = useTranslation(['stw-operations'])
  const rarity = rarityFromTemplate(item.templateId)
  const color = raritiesColor[rarity]
  const missing = item.state === 'missing'
  const armory = item.state === 'armory'
  const path = pathTag(item.cardKey)

  return (
    <button
      type="button"
      title={`${item.name} · ${t(`collection-book.state.${item.state}`)}`}
      disabled={missing}
      onClick={onOpen}
      className={cn(
        'relative flex h-[4.6rem] w-16 flex-col items-center justify-end overflow-hidden rounded-md border bg-background',
        missing && 'cursor-default opacity-40',
        armory && 'border-dashed',
      )}
      style={{ borderColor: color }}
    >
      <CollectionBookItemIcon item={item} />
      {!missing && (
        <span className="absolute left-0.5 top-0.5 text-[10px] font-bold leading-none">
          {item.level}
        </span>
      )}
      {armory && (
        <span className="absolute right-0.5 top-0.5 text-[10px] font-bold leading-none">
          +
        </span>
      )}
      {missing && (
        <span className="absolute text-lg font-light text-muted-foreground">+</span>
      )}
      <span className="z-[1] mb-0.5 text-[8px] leading-none" style={{ color }}>
        {'★'.repeat(Math.min(item.starTier, 5))}
      </span>
      {showPath && path && (
        <span className="absolute bottom-3 left-0 right-0 text-center text-[8px] text-muted-foreground">
          {path}
        </span>
      )}
    </button>
  )
}

function withTierOne(url?: string) {
  if (!url) {
    return undefined
  }

  const next = url.replace(/_T0[2-6](\.png)(\?.*)?$/i, '_T01$1$2')

  return next === url ? undefined : next
}

function portraitAttempts(item: CollectionBookItem) {
  const urls: Array<string> = []
  const add = (url?: string | null) => {
    if (url && !urls.includes(url)) {
      urls.push(url)
    }
  }

  add(item.imageUrl)
  add(withTierOne(item.imageUrl))

  if (item.type === 'hero') {
    const portrait = itemIconUrl(`Hero:hid_${item.cardKey}_t01`)
    add(portrait)
    add(withTierOne(portrait ?? undefined))
  } else if (item.type === 'worker') {
    add(itemIconUrl(`Worker:${item.cardKey}_t01`))
  } else if (item.type === 'schematic') {
    const ore = schematicIconUrl(item.templateId)
    add(ore)
    add(ore.replace(/_Ore_T01\.png/i, '_Crystal_T01.png'))
  }

  add(item.fallbackUrl)

  return urls
}

function CollectionBookItemIcon({ item }: { item: CollectionBookItem }) {
  const attempts = useMemo(
    () => portraitAttempts(item),
    [item.imageUrl, item.fallbackUrl, item.cardKey, item.templateId, item.type],
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [attempts])

  const src = attempts[index]

  if (!src) {
    return null
  }

  return (
    <img
      src={src}
      alt=""
      className="absolute inset-0 size-full object-contain p-1"
      onError={() => setIndex((current) => current + 1)}
    />
  )
}

function StatChip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-md border px-2 py-1.5 text-center text-xs font-medium',
        accent
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
          : 'bg-background',
      )}
    >
      {label}
    </div>
  )
}

function upgradableItems(
  items: Array<CollectionBookItem>,
  sectionIds: Array<CollectionBookSectionId>,
) {
  const allowed = new Set(sectionIds)

  return items.filter(
    (item) =>
      allowed.has(item.sectionId) &&
      item.state !== 'missing' &&
      Boolean(item.itemId) &&
      item.level < item.maxLevel,
  )
}

function suggestedLevel(item: CollectionBookItem) {
  const next = LEVEL_CHOICES.find((level) => level > item.level && level <= item.maxLevel)

  return next ?? item.maxLevel
}

function pathTag(cardKey: string) {
  if (cardKey.endsWith('_crystal')) return 'Crystal'
  if (cardKey.endsWith('_ore')) return 'Ore'
  return ''
}

function groupCards(cards: Array<CollectionBookItem>) {
  const map = new Map<string, Array<CollectionBookItem>>()

  cards.forEach((card) => {
    const list = map.get(card.name) ?? []
    list.push(card)
    map.set(card.name, list)
  })

  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, group]) => {
      const sorted = [...group].sort(
        (a, b) => rarityRank(a.rarity) - rarityRank(b.rarity),
      )
      const tags = new Set(sorted.map((card) => pathTag(card.cardKey)).filter(Boolean))

      return {
        name,
        cards: sorted,
        showPath: tags.size > 1,
      }
    })
}

function rarityRank(rarity: string) {
  const index = RARITY_ORDER.indexOf(rarity)
  return index < 0 ? 99 : index
}

function usePageCards(
  owned: Array<CollectionBookItem>,
  sectionIds: Array<CollectionBookSectionId>,
  filter: string,
  hideMaxed: boolean,
) {
  return useMemo(() => {
    const allowed = new Set(sectionIds)
    const byKey = new Map(owned.map((item) => [item.cardKey, item]))
    const cards: Array<CollectionBookItem> = []

    owned.forEach((item) => {
      if (allowed.has(item.sectionId)) {
        cards.push(item)
      }
    })

    stwCatalogEntries().forEach(([cardKey, entry]) => {
      if (byKey.has(cardKey) || !allowed.has(entry.p as CollectionBookSectionId)) {
        return
      }

      cards.push(missingCard(cardKey, entry))
    })

    const query = filter.trim().toLowerCase()

    return cards.filter((card) => {
      if (hideMaxed && card.state === 'book' && card.level >= card.maxLevel) {
        return false
      }

      if (!query) {
        return true
      }

      return (
        card.name.toLowerCase().includes(query) ||
        card.templateId.toLowerCase().includes(query)
      )
    })
  }, [owned, sectionIds, filter, hideMaxed])
}

function tierForCardKey(cardKey: string) {
  const id = cardKey.toLowerCase()

  if (/(^|_)(?:ur|sr)(_|$)/.test(id)) return 't05'
  if (/(^|_)vr(_|$)/.test(id)) return 't04'
  if (/(^|_)r(_|$)/.test(id)) return 't03'
  if (/(^|_)uc(_|$)/.test(id)) return 't02'

  return 't01'
}

function templateFor(
  cardKey: string,
  kind: StwNameKind,
  tier = tierForCardKey(cardKey),
) {
  if (kind === 'h') return `Hero:hid_${cardKey}_${tier}`
  if (kind === 'd') return `Defender:did_${cardKey}_${tier}`
  if (kind === 's' || kind === 'l') return `Worker:${cardKey}_${tier}`
  if (kind === 't') return `Schematic:tid_${cardKey}_${tier}`

  return `Schematic:sid_${cardKey}_${tier}`
}

function costKindForEntry(kind: StwNameKind): CollectionBookCostKind {
  if (kind === 'h') return 'hero'
  if (kind === 'd') return 'defender'
  if (kind === 'l') return 'lead'
  if (kind === 's') return 'survivor'
  if (kind === 't') return 'trap'
  return 'weapon'
}

function missingCard(cardKey: string, entry: StwNameEntry): CollectionBookItem {
  const templateId = templateFor(cardKey, entry.k)
  const iconId =
    entry.k === 'h' || entry.k === 's' || entry.k === 'l'
      ? templateFor(cardKey, entry.k, 't01')
      : templateId
  const parsed = parseResource({ key: iconId, quantity: 1 })
  const rarity = rarityFromTemplate(templateId)
  const name =
    entry.k === 'd' || entry.n.toLowerCase() === 'defender'
      ? parsed.name || entry.n
      : entry.n

  return {
    itemId: '',
    cardKey,
    templateId,
    name,
    type:
      entry.k === 'h'
        ? 'hero'
        : entry.k === 'd'
          ? 'defender'
          : entry.k === 's' || entry.k === 'l'
            ? 'worker'
            : 'schematic',
    costKind: costKindForEntry(entry.k),
    sectionId: entry.p as CollectionBookSectionId,
    level: 0,
    maxLevel: levelCeiling(templateId, 0),
    starTier: parseStarTier(templateId),
    rarity,
    favorite: false,
    state: 'missing',
    profileId: '',
    armoryCount: 0,
    imageUrl: parsed.imgUrl,
    fallbackUrl: parsed.fallbackUrl,
  }
}
