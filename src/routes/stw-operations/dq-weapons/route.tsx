import type { DqWeaponKind, DqWeaponMatch } from '../../../lib/stw/dq-weapons'
import type { DqWeaponsAccountData } from '../../../types/dq-weapons'

import { UpdateIcon } from '@radix-ui/react-icons'
import { createRoute } from '@tanstack/react-router'
import { X } from 'lucide-react'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip'

import {
  DQ_WEAPON_KINDS,
  LAMP_PERK_TEXT,
  PERK_PIP_COLOR,
  SCHEMATIC_RARITY_LABELS,
  inspectPerks,
} from '../../../lib/stw/dq-weapons'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

import { useDqWeaponsPage } from './-hooks'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/stw-operations/dq-weapons',
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
                {t('stw-operations.options.dq-weapons')}
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
    results,
    favoriteButtonIsDisabled,
    fetchButtonIsDisabled,
    isFavoriting,
    isLoading,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    dqWeaponsUpdateAccounts,
    dqWeaponsUpdateTags,
    handleFavorite,
    handleFetch,
  } = useDqWeaponsPage()

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
                onUpdateAccounts={dqWeaponsUpdateAccounts}
                onUpdateTags={dqWeaponsUpdateTags}
              />
              <Button
                className="shrink-0"
                onClick={handleFetch}
                disabled={fetchButtonIsDisabled}
                id="load-dq-weapons-button"
              >
                {isLoading ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  t('dq-weapons.form.submit-button')
                )}
              </Button>
              <Button
                className="shrink-0"
                onClick={handleFavorite}
                disabled={favoriteButtonIsDisabled}
              >
                {isFavoriting ? (
                  <UpdateIcon className="animate-spin" />
                ) : (
                  t('dq-weapons.form.favorite-button')
                )}
              </Button>
            </div>

            <Card className="w-full">
              <CardContent className="p-0">
                {results.length <= 0 ? (
                  <div className="px-4 py-5 text-sm text-muted-foreground">
                    {t('dq-weapons.list.empty')}
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
                              {t('dq-weapons.list.ready', {
                                count: account.haveCount,
                              })}
                            </Badge>
                          </div>

                          {account.errorMessage ? (
                            <div className="border-l-4 border-red-400 mt-2 pl-2 text-red-400 text-sm">
                              {account.errorMessage}
                            </div>
                          ) : (
                            <AccountWeapons account={account} />
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

      <GoToTop containerId="load-dq-weapons-button" />
    </TooltipProvider>
  )
}

function AccountWeapons({ account }: { account: DqWeaponsAccountData }) {
  const [openKind, setOpenKind] = useState<DqWeaponKind | null>(null)
  const match = openKind ? account.weapons[openKind] : null

  return (
    <div className="mt-2">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-6">
        {DQ_WEAPON_KINDS.map((kind) => (
          <KindCell
            key={kind}
            kind={kind}
            match={account.weapons[kind]}
            active={openKind === kind}
            onSelect={() => {
              if (!account.weapons[kind]) {
                return
              }

              setOpenKind((current) => (current === kind ? null : kind))
            }}
          />
        ))}
      </div>
      {match ? (
        <InspectDrawer
          key={match.itemId || `${account.accountId}-${openKind}`}
          match={match}
        />
      ) : null}
    </div>
  )
}

function StwIcon({
  src,
  className,
}: {
  src: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return null
  }

  return (
    <img
      src={src}
      alt=""
      className={cn('pointer-events-none object-contain', className)}
      onError={() => setFailed(true)}
    />
  )
}

function KindCell({
  kind,
  match,
  active,
  onSelect,
}: {
  kind: DqWeaponKind
  match: DqWeaponMatch | null
  active: boolean
  onSelect: () => void
}) {
  const { t } = useTranslation(['stw-operations'])
  const label = t(`dq-weapons.kinds.${kind}`)
  const has = match !== null
  const chip = (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs',
        has
          ? 'cursor-pointer border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
          : 'cursor-default border-border text-muted-foreground',
        active && 'outline outline-2 outline-amber-400 outline-offset-1'
      )}
      onClick={onSelect}
    >
      {has ? (
        <StwIcon
          src={match.imageUrl}
          className="h-6 w-6 shrink-0 drop-shadow"
        />
      ) : (
        <X className="size-3 shrink-0" />
      )}
      <span className="truncate">{label}</span>
      {has && match.power > 0 ? (
        <span className="ml-auto shrink-0 tabular-nums">{match.power}</span>
      ) : null}
    </button>
  )

  if (has) {
    return chip
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{chip}</TooltipTrigger>
      <TooltipContent>
        <p>{t('dq-weapons.list.missing')}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function PerkPips({
  filled,
  rarity,
}: {
  filled: number
  rarity: DqWeaponMatch['rarity']
}) {
  const color = rarity ? PERK_PIP_COLOR[rarity] : 'bg-zinc-400'

  return (
    <span className="flex w-2.5 shrink-0 flex-col gap-px">
      {Array.from({ length: 5 }, (_, index) => (
        <i
          key={index}
          className={cn(
            'block h-[3px] rounded-[1px]',
            index < filled ? color : 'bg-zinc-700'
          )}
        />
      ))}
    </span>
  )
}

function InspectDrawer({ match }: { match: DqWeaponMatch }) {
  const { t } = useTranslation(['stw-operations'])
  const { perks, lamp } = inspectPerks(match.alterations ?? [])
  const rarityLabel = match.rarity
    ? SCHEMATIC_RARITY_LABELS[match.rarity]
    : null
  const stars = '★'.repeat(Math.max(1, match.star || 1))
  const lampText = lamp?.label ?? LAMP_PERK_TEXT

  return (
    <div className="mt-2 flex overflow-hidden rounded-md border border-orange-950/80 bg-[#14110e]">
      <div className="w-[11.5rem] shrink-0 bg-gradient-to-b from-[#2a2118] to-[#1a1612] px-3 py-2.5">
        <StwIcon
          src={match.imageUrl}
          className="mb-2 h-16 w-16 drop-shadow"
        />
        <div className="text-[10px] font-bold uppercase tracking-wide text-amber-400">
          {rarityLabel ? `${rarityLabel} · ` : ''}
          {t('dq-weapons.inspect.schematic')}
        </div>
        <div className="mt-0.5 text-sm font-extrabold leading-tight text-orange-500">
          {match.name}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-extrabold tabular-nums text-orange-400">
            {match.power}
          </span>
          <span className="text-[11px] tracking-widest text-amber-400">
            {stars}
          </span>
          <span className="text-[11px] text-stone-300">
            {t('dq-weapons.inspect.level', { level: match.level })}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {perks.map((perk, index) => (
          <div
            key={`${match.itemId}-${index}-${perk.id}`}
            className="flex items-center gap-2 border-t border-white/5 px-2.5 py-1.5 text-[11px] text-stone-200 first:border-t-0"
          >
            <PerkPips filled={perk.filled} rarity={perk.rarity} />
            <span className="truncate">{perk.label}</span>
          </div>
        ))}
      </div>

      <div className="w-[11.75rem] shrink-0 border-l border-amber-500/20 bg-amber-400/10 px-2.5 py-2 text-[11px] leading-snug text-amber-100">
        {lampText}
      </div>
    </div>
  )
}
