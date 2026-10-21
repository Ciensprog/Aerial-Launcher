import type {
  WorldInfo,
  WorldInfoMission,
} from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'

import {
  World,
  worldInfoOrdering,
} from '../../../config/constants/fortnite/world-info'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useWorldInfo } from '../../../hooks/advanced-mode/world-info'
import {
  useMissionSwapActions,
  useMissionSwapData,
} from '../../../hooks/alerts/mission-swap'
import { useDebouncedPersist } from '../../../hooks/use-debounced-persist'

import {
  fileBasename,
  parseWorldInfoFile,
} from '../../../lib/parsers/world-info-file'
import {
  applyMissionSwaps,
  generatorsMatch,
  indexWorldInfoByTile,
  missionTileKey,
} from '../../../lib/misje/swap-missions'
import {
  DEFAULT_SWAP_DISPLAY_NAME,
  MISJE_PRESETS,
} from '../../../lib/misje/presets'
import { applyWorldInfoModifications } from '../../../lib/misje/world-info-mods'
import { getWorldInfoMissionDay } from '../../../lib/misje/world-info-day'
import { toast } from '../../../lib/notifications'
import { useMissionSwapStore } from '../../../state/alerts/mission-swap'

import { useAlertsOverviewData } from '../-alerts-overview/-hooks'

export type SwapVbucksMission = {
  mission: WorldInfoMission
  missionId: string
  theaterId: World
}

function isVbucksItem(itemId: string) {
  return itemId.toLowerCase().includes('currency_mtxswap')
}

function missionHasVbucks(mission: WorldInfoMission) {
  return (
    mission.ui.alert.rewards.some((reward) => isVbucksItem(reward.itemId)) ||
    mission.ui.mission.rewards.some((reward) =>
      isVbucksItem(reward.itemId),
    ) ||
    mission.filters.some((filter) => isVbucksItem(filter))
  )
}

function theaterRank(theaterId: World) {
  return (
    worldInfoOrdering[
      theaterId as keyof typeof worldInfoOrdering
    ] ?? 99
  )
}

function splitVbucksFirst(worldInfo: WorldInfo) {
  const vbucks: Array<SwapVbucksMission> = []
  const rest = new Collection() as WorldInfo

  worldInfo.forEach((missions, theaterId) => {
    const remaining = new Collection<string, WorldInfoMission>()

    missions.forEach((mission, missionId) => {
      if (missionHasVbucks(mission)) {
        vbucks.push({ mission, missionId, theaterId })
      } else {
        remaining.set(missionId, mission)
      }
    })

    if (remaining.size > 0) {
      rest.set(theaterId, remaining)
    }
  })

  vbucks.sort(
    (itemA, itemB) =>
      theaterRank(itemA.theaterId) - theaterRank(itemB.theaterId),
  )

  return { rest, vbucks }
}

export function useMissionSwapPage() {
  const { t } = useTranslation(['alerts'])
  const { rawData } = useWorldInfo()
  const overview = useAlertsOverviewData()
  const {
    yesterdayFilename,
    yesterdayPath,
    yesterdayRaw,
    yesterdayWorldInfo,
    yesterdayManual,
    yesterdayMissing,
    selected,
    onlyDifferent,
    onlyAlerts,
  } = useMissionSwapData()
  const {
    clearYesterday,
    setOnlyAlerts,
    setOnlyDifferent,
    setSelected,
    setYesterday,
    setYesterdayMissing,
    toggleSelected,
  } = useMissionSwapActions()

  const [busy, setBusy] = useState(false)
  const [saveMode, setSaveMode] = useState<'new' | 'overwrite'>('overwrite')
  const [outputDir, setOutputDir] = useState('')
  const [customFile, setCustomFile] = useState('')

  const yesterdayByTile = useMemo(
    () => indexWorldInfoByTile(yesterdayWorldInfo),
    [yesterdayWorldInfo],
  )

  const applyYesterdayFile = useCallback(
    (filePath: string, raw: unknown, manual = false) => {
      const parsed = parseWorldInfoFile(raw)

      if (parsed.worldInfo.size <= 0) {
        toast(t('world-info.notifications.error'), { duration: 5000 })
        return false
      }

      setYesterday({
        filename: fileBasename(filePath),
        path: filePath,
        raw: parsed.raw,
        worldInfo: parsed.worldInfo,
        manual,
      })

      return true
    },
    [setYesterday, t],
  )

  const persistConfig = useCallback(
    async (next?: {
      outputDir?: string
      customFilePath?: string
      yesterdayFilePath?: string
    }) => {
      await window.electronAPI.misjeSaveConfig({
        outputDir: next?.outputDir ?? outputDir,
        customFilePath: next?.customFilePath ?? customFile,
        ...(next?.yesterdayFilePath !== undefined
          ? { yesterdayFilePath: next.yesterdayFilePath }
          : {}),
      })
    },
    [customFile, outputDir],
  )

  const debouncedPersistConfig = useDebouncedPersist(persistConfig, 400)

  useEffect(() => {
    let cancelled = false

    const loadSavedState = async () => {
      try {
        const config = await window.electronAPI.misjeGetConfig()
        if (cancelled) {
          return
        }

        setOutputDir(config.outputDir ?? '')
        setCustomFile(config.customFilePath ?? '')
      } catch {
        // Config may be missing on first run.
      }
    }

    loadSavedState().catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (yesterdayManual) {
      return
    }

    let cancelled = false

    const loadYesterday = async () => {
      try {
        const todayDate = getWorldInfoMissionDay(rawData)
        const sources =
          await window.electronAPI.worldInfoGetSwapSources(todayDate)

        if (cancelled || useMissionSwapStore.getState().yesterdayManual) {
          return
        }

        const yesterdayFilePath = sources.yesterday?.path
        if (!yesterdayFilePath) {
          setYesterdayMissing(true)
          return
        }

        const current = useMissionSwapStore.getState()
        if (current.yesterdayPath === yesterdayFilePath && current.yesterdayRaw) {
          return
        }

        const raw = await window.electronAPI.misjeReadFile(yesterdayFilePath)

        if (cancelled || useMissionSwapStore.getState().yesterdayManual) {
          return
        }

        if (!applyYesterdayFile(yesterdayFilePath, raw, false)) {
          setYesterdayMissing(true)
        }
      } catch {
        if (!cancelled && !useMissionSwapStore.getState().yesterdayManual) {
          setYesterdayMissing(true)
        }
      }
    }

    loadYesterday().catch(() => {})

    return () => {
      cancelled = true
    }
  }, [
    applyYesterdayFile,
    rawData,
    setYesterdayMissing,
    yesterdayManual,
  ])

  const data = useMemo(() => {
    const source = yesterdayRaw
      ? overview.data.entries().reduce(
          (
            accumulator: WorldInfo,
            [theaterId, missions]: [
              World,
              Collection<string, WorldInfoMission>,
            ],
          ) => {
            const filtered = missions.filter((mission: WorldInfoMission) => {
              const key = missionTileKey(
                theaterId,
                mission.raw.mission.tileIndex,
              )
              const yesterday = yesterdayByTile.get(key)
              const hasAlert = (mission.ui.alert.rewards.length ?? 0) > 0
              const isDifferent = Boolean(
                yesterday && !generatorsMatch(mission, yesterday),
              )

              if (onlyAlerts && !hasAlert) {
                return false
              }

              if (onlyDifferent && !isDifferent) {
                return false
              }

              return true
            })

            if (filtered.size > 0) {
              accumulator.set(theaterId, filtered)
            }

            return accumulator
          },
          new Collection() as WorldInfo,
        )
      : overview.data

    return splitVbucksFirst(source)
  }, [
    onlyAlerts,
    onlyDifferent,
    overview.data,
    yesterdayByTile,
    yesterdayRaw,
  ])

  const selectedCount = Object.keys(selected).length
  const differentAlertKeys = useMemo(() => {
    const keys: Array<string> = []

    overview.data.forEach(
      (
        missions: Collection<string, WorldInfoMission>,
        theaterId: World,
      ) => {
        missions.forEach((mission: WorldInfoMission) => {
          if (mission.ui.alert.rewards.length <= 0) {
            return
          }

          const key = missionTileKey(
            theaterId,
            mission.raw.mission.tileIndex,
          )
          const yesterday = yesterdayByTile.get(key)

          if (yesterday && !generatorsMatch(mission, yesterday)) {
            keys.push(key)
          }
        })
      },
    )

    return keys
  }, [overview.data, yesterdayByTile])

  const pickYesterday = async () => {
    const filePath = await window.electronAPI.misjePickFile()

    if (!filePath) {
      return
    }

    try {
      const raw = await window.electronAPI.misjeReadFile(filePath)
      if (!applyYesterdayFile(filePath, raw, true)) {
        return
      }

      await window.electronAPI.misjeSaveConfig({
        yesterdayFilePath: filePath,
      })
    } catch {
      toast(t('world-info.notifications.error'), { duration: 5000 })
    }
  }

  const selectDifferentAlerts = () => {
    setSelected(
      Object.fromEntries(differentAlertKeys.map((key) => [key, true])),
    )
  }

  const clearSelected = () => {
    setSelected({})
  }

  const unloadYesterday = async () => {
    clearYesterday()
    await window.electronAPI.misjeSaveConfig({
      yesterdayFilePath: '',
    })
  }

  const pickOutputDir = async () => {
    const dir = await window.electronAPI.misjePickDir()
    if (!dir) {
      return
    }

    setOutputDir(dir)
    debouncedPersistConfig.cancel()
    await persistConfig({ outputDir: dir })
  }

  const pickOutputFile = async () => {
    const file = await window.electronAPI.misjePickFile()
    if (!file) {
      return
    }

    setCustomFile(file)
    debouncedPersistConfig.cancel()
    await persistConfig({ customFilePath: file })
  }

  const saveSwappedFile = async () => {
    if (!rawData || !yesterdayRaw || selectedCount <= 0) {
      toast(t('swap.notifications.missing-data'), { duration: 5000 })
      return
    }

    setBusy(true)

    try {
      let swapped: unknown = applyMissionSwaps(
        rawData,
        yesterdayRaw,
        Object.keys(selected),
      )

      const config = await window.electronAPI.misjeGetConfig()
      swapped = applyWorldInfoModifications(
        swapped,
        MISJE_PRESETS.normalFilePlus.options,
        config.displayNameValue || DEFAULT_SWAP_DISPLAY_NAME,
      )

      const defaultName = `${dayjs().format('DD.MM')}-swap.json`
      let target: string | null = null

      if (saveMode === 'overwrite') {
        target = customFile.trim()
        if (!target) {
          toast(t('swap.notifications.missing-output-file'), {
            duration: 5000,
          })
          return
        }
      } else {
        const defaultPath = outputDir
          ? `${outputDir.replace(/[/\\]$/, '')}\\${defaultName}`
          : defaultName
        target = await window.electronAPI.misjePickSaveFile(defaultPath)
      }

      if (!target) {
        return
      }

      const saved = await window.electronAPI.misjeSaveFile(target, swapped)
      toast(
        t('swap.notifications.saved', {
          path: saved,
          count: selectedCount,
        }),
        { duration: 4000 },
      )
    } catch (error) {
      toast(
        t('swap.notifications.save-error', {
          message:
            error instanceof Error ? error.message : String(error),
        }),
        { duration: 5000 },
      )
    } finally {
      setBusy(false)
    }
  }

  return {
    ...overview,
    data: data.rest,
    vbucks: data.vbucks,
    busy,
    yesterdayByTile,
    yesterdayFilename,
    yesterdayPath,
    yesterdayRaw,
    yesterdayMissing,
    selected,
    selectedCount,
    differentCount: differentAlertKeys.length,
    onlyDifferent,
    onlyAlerts,
    hasTodayRaw: Boolean(rawData),
    saveMode,
    outputDir,
    customFile,
    pickYesterday,
    unloadYesterday,
    selectDifferentAlerts,
    clearSelected,
    saveSwappedFile,
    setOnlyAlerts,
    setOnlyDifferent,
    setSaveMode,
    setOutputDir,
    setCustomFile,
    persistConfig,
    debouncedPersistConfig,
    pickOutputDir,
    pickOutputFile,
    toggleSelected,
  }
}

export type SwapPageData = ReturnType<typeof useMissionSwapPage>
