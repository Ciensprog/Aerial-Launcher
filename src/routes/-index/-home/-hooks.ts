import type { WorldInfoMission } from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { useMemo } from 'react'

import {
  World,
  worldPowerLevel,
} from '../../../config/constants/fortnite/world-info'

import { useWorldInfo } from '../../../hooks/advanced-mode/world-info'

import { isLegendaryOrMythicSurvivor } from '../../../lib/validations/resources'

export function useHomeData() {
  const { data, isFetching, isReloading } = useWorldInfo()

  const {
    survivors,
    twinePeaks,
    uncommonPerks,
    upgradeLlamas,
    vbucks,
    ventures,
  } = useMemo(() => {
    const vbucks = new Collection<string, WorldInfoMission>()
    const survivors = new Collection<string, WorldInfoMission>()
    const upgradeLlamas = new Collection<string, WorldInfoMission>()
    const uncommonPerks = new Collection<string, WorldInfoMission>()

    data.entries().forEach(([, missions]) => {
      missions.forEach((mission) => {
        if (
          mission.ui.alert.rewards.some((reward) =>
            reward.itemId.includes('currency_mtxswap')
          )
        ) {
          vbucks.set(mission.raw.mission.missionGuid, mission)
        }

        if (
          mission.ui.alert.rewards.some((reward) =>
            isLegendaryOrMythicSurvivor(reward.itemId)
          )
        ) {
          survivors.set(mission.raw.mission.missionGuid, mission)
        }

        if (
          mission.ui.alert.rewards.some((reward) =>
            reward.itemId.includes('voucher_cardpack_bronze')
          )
        ) {
          upgradeLlamas.set(mission.raw.mission.missionGuid, mission)
        }

        if (
          mission.ui.alert.rewards.some((reward) =>
            reward.itemId.includes('alteration_upgrade_uc')
          ) ||
          mission.ui.mission.rewards.some((reward) =>
            reward.itemId.includes('alteration_upgrade_uc')
          )
        ) {
          uncommonPerks.set(mission.raw.mission.missionGuid, mission)
        }
      })
    })

    const twinePeaks =
      data
        .get(World.TwinePeaks)
        ?.filter(
          (mission) =>
            mission.ui.powerLevel ===
            worldPowerLevel[World.TwinePeaks].Endgame_Zone6
        ) ?? new Collection<string, WorldInfoMission>()

    const ventures =
      data
        .entries()
        .filter(
          ([theaterId]) =>
            World.Stonewood !== theaterId &&
            World.Plankerton !== theaterId &&
            World.CannyValley !== theaterId &&
            World.TwinePeaks !== theaterId
        )
        .toArray()?.[0]?.[1]
        ?.filter(
          (mission) =>
            mission.ui.powerLevel ===
            worldPowerLevel.ventures.Phoenix_Zone25
        ) ?? new Collection<string, WorldInfoMission>()

    return {
      survivors,
      twinePeaks,
      uncommonPerks,
      upgradeLlamas,
      vbucks,
      ventures,
    }
  }, [data])

  return {
    survivors,
    uncommonPerks,
    upgradeLlamas,
    vbucks,
    endgame: {
      twinePeaks,
      ventures,
    },
    loading: {
      isFetching,
      isReloading,
    },
  }
}
