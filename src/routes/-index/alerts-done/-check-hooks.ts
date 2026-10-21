import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { missionTypeOptions } from '../../../config/constants/alerts/filters'
import { World, worldInfoOrdering } from '../../../config/constants/fortnite/world-info'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'
import { useWorldInfo } from '../../../hooks/advanced-mode/world-info'
import {
  useGetAlertsDoneCheckActions,
  useGetAlertsDoneCheckData,
} from '../../../hooks/alerts/alerts-done-check'
import { useGetAccounts } from '../../../hooks/accounts'
import { useAlertsDoneCheckStore } from '../../../state/alerts/alerts-done-check'

import { toast } from '../../../lib/notifications'

const TYPE_LABELS = Object.fromEntries(
  missionTypeOptions.map((item) => [item.value, item.label]),
) as Record<string, string>

export type CheckMissionOption = {
  alertId: string
  isVbucks: boolean
  label: string
  mission: WorldInfoMission
  theaterId: World
  vbucks: number
}

export type CheckMissionGroup = {
  theaterId: World
  missions: Array<CheckMissionOption>
}

function isVbucksMission(mission: WorldInfoMission) {
  return mission.ui.alert.rewards.some((reward) =>
    reward.itemId.includes('currency_mtxswap'),
  )
}

function vbucksQuantity(mission: WorldInfoMission) {
  return (
    mission.ui.alert.rewards.find((reward) =>
      reward.itemId.includes('currency_mtxswap'),
    )?.quantity ?? 0
  )
}

function missionTypeLabel(mission: WorldInfoMission) {
  const typeId = mission.ui.mission.zone.type.id

  return TYPE_LABELS[typeId] ?? typeId
}

function theaterOrder(theaterId: World) {
  return worldInfoOrdering[theaterId as keyof typeof worldInfoOrdering] ?? -1
}

export function useAlertsDoneCheckPage() {
  const { t } = useTranslation(['alerts', 'general'])
  const { data } = useWorldInfo()
  const { accountList } = useGetAccounts()
  const { selectedAccounts, selectedTags } = useGetAlertsDoneCheckData()
  const { alertsDoneCheckUpdateAccounts, alertsDoneCheckUpdateTags } =
    useGetAlertsDoneCheckActions()
  const {
    accounts,
    areThereAccounts,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    getAccounts,
  } = useAccountSelectorData({
    selectedAccounts,
    selectedTags,
  })

  const { results, isLoading, selectedAlertIds, useAllVbucks } =
    useAlertsDoneCheckStore(
      useShallow((state) => ({
        results: state.results,
        isLoading: state.isLoading,
        selectedAlertIds: state.selectedAlertIds,
        useAllVbucks: state.useAllVbucks,
      })),
    )
  const setLoading = useAlertsDoneCheckStore((state) => state.setLoading)
  const setSelectedAlertIds = useAlertsDoneCheckStore(
    (state) => state.setSelectedAlertIds,
  )
  const setUseAllVbucks = useAlertsDoneCheckStore(
    (state) => state.setUseAllVbucks,
  )

  const missions = useMemo(() => {
    const list: Array<CheckMissionOption> = []

    data.forEach((zoneMissions: Collection<string, WorldInfoMission>, theaterId: World) => {
      zoneMissions.forEach((mission: WorldInfoMission) => {
        const alertId = mission.raw.alert?.missionAlertGuid

        if (!alertId || mission.ui.alert.rewards.length <= 0) {
          return
        }

        const vbucks = vbucksQuantity(mission)
        const typeLabel = missionTypeLabel(mission)
        const vbucksLabel = vbucks > 0 ? ` · ${vbucks} V-Bucks` : ''

        list.push({
          alertId,
          isVbucks: isVbucksMission(mission),
          label: `${mission.ui.mission.zone.letter} ⚡${mission.ui.powerLevel} ${typeLabel} #${mission.raw.mission.tileIndex}${vbucksLabel}`,
          mission,
          theaterId,
          vbucks,
        })
      })
    })

    list.sort((itemA, itemB) => {
      const zoneDiff =
        theaterOrder(itemA.theaterId) - theaterOrder(itemB.theaterId)

      if (zoneDiff !== 0) {
        return zoneDiff
      }

      if (itemA.isVbucks !== itemB.isVbucks) {
        return itemA.isVbucks ? -1 : 1
      }

      return itemB.mission.ui.powerLevel - itemA.mission.ui.powerLevel
    })

    return list
  }, [data])

  const vbuckAlertIds = useMemo(
    () => missions.filter((item) => item.isVbucks).map((item) => item.alertId),
    [missions],
  )

  useEffect(() => {
    if (!useAllVbucks) {
      return
    }

    setSelectedAlertIds(vbuckAlertIds)
  }, [setSelectedAlertIds, useAllVbucks, vbuckAlertIds])

  const missionGroups = useMemo(() => {
    const groups: Array<CheckMissionGroup> = []
    const indexByTheater = new Map<World, number>()

    for (const item of missions) {
      const existing = indexByTheater.get(item.theaterId)

      if (existing === undefined) {
        indexByTheater.set(item.theaterId, groups.length)
        groups.push({
          theaterId: item.theaterId,
          missions: [item],
        })
      } else {
        groups[existing].missions.push(item)
      }
    }

    return groups
  }, [missions])

  const selectedMissions = useMemo(
    () =>
      missions.filter((item) => selectedAlertIds.includes(item.alertId)),
    [missions, selectedAlertIds],
  )

  const fetchButtonIsDisabled =
    isSelectedEmpty ||
    isLoading ||
    !areThereAccounts ||
    selectedAlertIds.length <= 0

  const handleFetch = () => {
    if (fetchButtonIsDisabled) {
      return
    }

    const selected = getAccounts()

    if (selected.length <= 0) {
      toast(
        t('form.accounts.no-linked', {
          ns: 'general',
        }),
      )

      return
    }

    setLoading(true)
    window.electronAPI.requestAlertsDoneCheck(selected)
  }

  const handleToggleMission = (alertId: string) => {
    if (useAllVbucks) {
      setUseAllVbucks(false)
      setSelectedAlertIds([alertId])

      return
    }

    setSelectedAlertIds(
      selectedAlertIds.includes(alertId)
        ? selectedAlertIds.filter((id) => id !== alertId)
        : [...selectedAlertIds, alertId],
    )
  }

  const handleAllVbucks = () => {
    setUseAllVbucks(true)
    setSelectedAlertIds(vbuckAlertIds)
  }

  const handleDisableAllVbucks = () => {
    setUseAllVbucks(false)
  }

  const handleClearMissions = () => {
    setUseAllVbucks(false)
    setSelectedAlertIds([])
  }

  return {
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
    vbuckCount: vbuckAlertIds.length,
    alertsDoneCheckUpdateAccounts,
    alertsDoneCheckUpdateTags,
  }
}
