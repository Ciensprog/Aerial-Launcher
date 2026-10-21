import type { CSSProperties } from 'react'
import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'
import type { CheckMissionGroup, CheckMissionOption } from './-check-hooks'

import { UpdateIcon } from '@radix-ui/react-icons'
import {
  Check,
  ChevronsUpDown,
  Search,
  SquareCheckBigIcon,
  SquareIcon,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { worldNameByTheaterId } from '../../../config/constants/fortnite/world-info'

import { AccountSelectors } from '../../../components/selectors/accounts'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover'
import { ScrollArea } from '../../../components/ui/scroll-area'
import { Switch } from '../../../components/ui/switch'
import { Label } from '../../../components/ui/label'

import { MissionRewardsPreview } from '../-components/-missions'

import { assets } from '../../../lib/repository'
import { cn, parseCustomDisplayName } from '../../../lib/utils'

import { useAlertsDoneCheckPage } from './-check-hooks'

const vbucksIcon = assets('currency_mtxswap')

export function AlertsDoneCheck() {
  const { t } = useTranslation(['alerts', 'general', 'zones'])

  const {
    accounts,
    accountList,
    fetchButtonIsDisabled,
    handleAllVbucks,
    handleClearMissions,
    handleDisableAllVbucks,
    handleFetch,
    handleToggleMission,
    isLoading,
    missionGroups,
    missions,
    parsedSelectedAccounts,
    parsedSelectedTags,
    results,
    selectedAlertIds,
    selectedMissions,
    tags,
    useAllVbucks,
    vbuckCount,
    alertsDoneCheckUpdateAccounts,
    alertsDoneCheckUpdateTags,
  } = useAlertsDoneCheckPage()

  const selectedAlertIdSet = new Set(selectedAlertIds)

  return (
    <div className="mb-4 space-y-3 rounded-md border bg-muted/20 p-3">
      <div className="flex items-center gap-2">
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
          onUpdateAccounts={alertsDoneCheckUpdateAccounts}
          onUpdateTags={alertsDoneCheckUpdateTags}
        />
        <Button
          className="h-8 shrink-0 px-3"
          size="sm"
          onClick={handleFetch}
          disabled={fetchButtonIsDisabled}
        >
          {isLoading ? (
            <UpdateIcon className="animate-spin" />
          ) : (
            t('check.submit')
          )}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex shrink-0 items-center gap-2">
          <Switch
            id="alerts-done-all-vbucks"
            checked={useAllVbucks}
            onCheckedChange={(checked) => {
              if (checked) {
                handleAllVbucks()
              } else {
                handleDisableAllVbucks()
              }
            }}
          />
          <Label
            htmlFor="alerts-done-all-vbucks"
            className="flex items-center gap-1.5 text-sm"
          >
            <img
              src={vbucksIcon}
              alt=""
              className="size-4"
            />
            {t('check.all-vbucks', { count: vbuckCount })}
          </Label>
        </div>
        <CheckMissionPicker
          missionGroups={missionGroups}
          missions={missions}
          selectedAlertIdSet={selectedAlertIdSet}
          selectedMissions={selectedMissions}
          onClear={handleClearMissions}
          onToggle={handleToggleMission}
        />
      </div>

      {useAllVbucks && vbuckCount <= 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('check.no-vbucks')}
        </p>
      ) : null}

      {results.length <= 0 ? (
        <p className="text-sm text-muted-foreground">{t('check.empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {results.map((account) => {
            const accountData = accountList[account.accountId]
            const displayName = accountData
              ? parseCustomDisplayName(accountData)
              : account.accountId
            const claimed = new Set(account.claimedAlertIds)
            const doneCount = selectedMissions.filter((item) =>
              claimed.has(item.alertId),
            ).length
            const total = selectedMissions.length
            const allDone = total > 0 && doneCount === total

            return (
              <div
                key={account.accountId}
                className="min-w-0 rounded-md border bg-background/40 px-2 py-1.5"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <div className="min-w-0 truncate text-sm font-semibold text-[#e9c4cc]">
                    {displayName}
                  </div>
                  {account.available ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'shrink-0 font-medium text-[11px]',
                        allDone && 'bg-emerald-500/20 text-emerald-300',
                      )}
                    >
                      {t('check.summary', {
                        done: doneCount,
                        total,
                      })}
                    </Badge>
                  ) : null}
                </div>

                {account.errorMessage ? (
                  <div className="border-l-4 border-red-400 mt-1 pl-2 text-red-400 text-xs">
                    {account.errorMessage}
                  </div>
                ) : (
                  <ul className="mt-1 space-y-0.5">
                    {selectedMissions.map((item) => {
                      const done = claimed.has(item.alertId)

                      return (
                        <li
                          key={item.alertId}
                          className="flex min-w-0 items-center gap-1.5 text-xs"
                        >
                          {done ? (
                            <Check className="size-3.5 shrink-0 text-emerald-400" />
                          ) : (
                            <X className="size-3.5 shrink-0 text-red-400" />
                          )}
                          <img
                            src={item.mission.ui.mission.zone.type.imageUrl}
                            alt=""
                            className="size-3.5 shrink-0"
                          />
                          <span
                            className={cn(
                              'min-w-0 truncate',
                              !done && 'text-muted-foreground',
                            )}
                          >
                            {item.label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CheckMissionPicker({
  missionGroups,
  missions,
  onClear,
  onToggle,
  selectedAlertIdSet,
  selectedMissions,
}: {
  missionGroups: Array<CheckMissionGroup>
  missions: Array<CheckMissionOption>
  onClear: () => void
  onToggle: (alertId: string) => void
  selectedAlertIdSet: Set<string>
  selectedMissions: Array<CheckMissionOption>
}) {
  const { t } = useTranslation(['alerts', 'general', 'zones'])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredGroups = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) {
      return missionGroups
    }

    return missionGroups
      .map((group) => ({
        ...group,
        missions: group.missions.filter((item) => {
          const typeId = item.mission.ui.mission.zone.type.id

          return (
            item.label.toLowerCase().includes(query) ||
            item.alertId.toLowerCase().includes(query) ||
            typeId.toLowerCase().includes(query) ||
            String(item.mission.raw.mission.tileIndex).includes(query)
          )
        }),
      }))
      .filter((group) => group.missions.length > 0)
  }, [missionGroups, search])

  const selectedLabel =
    selectedMissions.length <= 0
      ? null
      : selectedMissions.length === 1
        ? selectedMissions[0].label
        : selectedMissions.map((item) => item.label).join(', ')

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)

        if (!nextOpen) {
          setSearch('')
        }
      }}
    >
      <div className="relative flex min-w-0 flex-1 items-center">
        <PopoverTrigger
          asChild
          disabled={missions.length <= 0}
        >
          <Button
            className="flex h-8 w-full justify-between pl-3 pr-2"
            size="sm"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={missions.length <= 0}
          >
            <div
              className={cn('min-w-0 flex-1 truncate text-left', {
                'text-muted-foreground': !selectedLabel,
              })}
            >
              {missions.length <= 0
                ? t('check.no-missions')
                : (selectedLabel ?? t('check.missions-placeholder'))}
            </div>
            <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {selectedMissions.length > 0 ? (
          <button
            type="button"
            className="absolute right-7 p-0.5 text-muted-foreground hover:text-white"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onClear()
            }}
          >
            <X className="size-4" />
            <span className="sr-only">clear values</span>
          </button>
        ) : null}
      </div>
      <PopoverContent
        align="start"
        className={cn(
          'w-[var(--radix-popover-trigger-width)] min-w-[20rem] max-w-[36rem] p-0',
          '[&_.img-rarity]:flex-shrink-0 [&_.img-rarity:not(.img-small)]:size-4 [&_.img-rarity]:size-3',
          '[&_.img-type]:flex-shrink-0 [&_.img-type]:size-6',
          '[&_.img-modifier]:flex-shrink-0 [&_.img-modifier]:size-6',
          '[&_.power]:border [&_.power]:flex-shrink-0 [&_.power]:pl-0.5 [&_.power]:pr-2 [&_.power]:py-1 [&_.power]:rounded [&_.power]:text-xs',
        )}
      >
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 size-4 shrink-0 opacity-50" />
          <input
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder={t('actions.search', { ns: 'general' })}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
            }}
          />
        </div>
        <ScrollArea className="h-64">
          <div className="space-y-1.5 p-1">
            {filteredGroups.length <= 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('no-item-found', { ns: 'general' })}
              </p>
            ) : (
              filteredGroups.map((group) => {
                const zoneTitle = worldNameByTheaterId[
                  group.theaterId as keyof typeof worldNameByTheaterId
                ]
                  ? t(group.theaterId, {
                      ns: 'zones',
                    })
                  : t('ventures', {
                      ns: 'zones',
                    })

                return (
                  <section
                    key={group.theaterId}
                    className="space-y-0.5"
                  >
                    <h3 className="px-1 text-xs font-semibold">
                      {zoneTitle}
                      <span className="ml-1 font-normal text-muted-foreground">
                        (
                        {t('information.missions', {
                          total: group.missions.length,
                        })}
                        )
                      </span>
                    </h3>
                    {group.missions.map((item) => (
                      <CheckMissionPickerRow
                        key={item.alertId}
                        item={item}
                        selected={selectedAlertIdSet.has(item.alertId)}
                        onToggle={onToggle}
                      />
                    ))}
                  </section>
                )
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function CheckMissionPickerRow({
  item,
  onToggle,
  selected,
}: {
  item: CheckMissionOption
  onToggle: (alertId: string) => void
  selected: boolean
}) {
  const { ui } = item.mission

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-1 rounded px-1 py-0.5 text-left',
        selected
          ? 'bg-[rgb(52_211_117_/_10%)] hover:bg-[rgb(52_211_117_/_16%)]'
          : 'bg-muted-foreground/5 hover:bg-muted-foreground/15',
      )}
      onClick={() => {
        onToggle(item.alertId)
      }}
    >
      {selected ? (
        <SquareCheckBigIcon
          className="size-3.5 shrink-0 text-[var(--zone-color-stonewood)]"
          size={14}
        />
      ) : (
        <SquareIcon
          className="size-3.5 shrink-0 text-muted-foreground/60"
          size={14}
        />
      )}
      <span className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
        <MissionZoneBadge mission={item.mission} />
        <img
          src={ui.mission.zone.type.imageUrl}
          alt=""
          className="img-type"
        />
        <span className="power">⚡{ui.powerLevel}</span>
        <MissionRewardsPreview mission={item.mission} />
      </span>
    </button>
  )
}

function MissionZoneBadge({ mission }: { mission: WorldInfoMission }) {
  const { zone } = mission.ui.mission

  if (zone.iconUrl) {
    return (
      <img
        src={zone.iconUrl}
        alt=""
        className="img-type"
      />
    )
  }

  return (
    <span
      className={cn(
        'border border-opacity-40 flex flex-shrink-0 font-bold items-center justify-center relative rounded size-5 text-xs uppercase',
        'border-[color:var(--zone-color)] text-[color:var(--zone-color)]',
      )}
      style={
        {
          '--zone-color': zone.color,
        } as CSSProperties
      }
    >
      {zone.letter}
    </span>
  )
}
