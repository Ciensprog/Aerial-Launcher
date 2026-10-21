import type {
  WorldInfo,
  WorldInfoMission,
} from '../../types/data/advanced-mode/world-info'
import type { WorldInfoData } from '../../types/services/advanced-mode/world-info'

export function missionTileKey(theaterId: string, tileIndex: number) {
  return `${theaterId}:${tileIndex}`
}

export function indexWorldInfoByTile(worldInfo: WorldInfo) {
  const map = new Map<string, WorldInfoMission>()

  worldInfo.forEach((missions, theaterId) => {
    missions.forEach((mission) => {
      map.set(
        missionTileKey(theaterId, mission.raw.mission.tileIndex),
        mission,
      )
    })
  })

  return map
}

export function generatorsMatch(
  today: WorldInfoMission,
  yesterday: WorldInfoMission | undefined,
) {
  if (!yesterday) {
    return false
  }

  return (
    today.raw.mission.missionGenerator ===
    yesterday.raw.mission.missionGenerator
  )
}

export function missionRewardsDiffer(
  today: WorldInfoMission,
  yesterday: WorldInfoMission | undefined,
) {
  if (!yesterday) {
    return false
  }

  return (
    JSON.stringify(today.raw.mission.missionRewards) !==
    JSON.stringify(yesterday.raw.mission.missionRewards)
  )
}

export function applyMissionSwaps(
  todayRaw: WorldInfoData,
  yesterdayRaw: WorldInfoData,
  selectedKeys: Iterable<string>,
): WorldInfoData {
  const selected = new Set(selectedKeys)
  const yesterdayByTile = new Map<
    string,
    WorldInfoData['missions'][number]['availableMissions'][number]
  >()

  for (const block of yesterdayRaw.missions ?? []) {
    for (const mission of block.availableMissions ?? []) {
      yesterdayByTile.set(
        missionTileKey(block.theaterId, mission.tileIndex),
        mission,
      )
    }
  }

  const result = structuredClone(todayRaw)

  for (const block of result.missions ?? []) {
    block.availableMissions = (block.availableMissions ?? []).map(
      (mission) => {
        const key = missionTileKey(block.theaterId, mission.tileIndex)

        if (!selected.has(key)) {
          return mission
        }

        const fromYesterday = yesterdayByTile.get(key)

        if (!fromYesterday) {
          return mission
        }

        return {
          ...structuredClone(fromYesterday),
          tileIndex: mission.tileIndex,
          availableUntil: mission.availableUntil,
        }
      },
    )
  }

  return result
}
