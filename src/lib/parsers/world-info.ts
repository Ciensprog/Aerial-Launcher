import type {
  WorldInfo,
  WorldInfoMission,
} from '../../types/data/advanced-mode/world-info'
import type { WorldInfoData } from '../../types/services/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'

import {
  modifiersAvailable,
  World,
  WorldColor,
  worldInfoOrdering,
  WorldLetter,
  worldPowerLevel,
  WorldStormKingZone,
  zoneColors,
  zoneLetters,
  zonesCategories,
  zonesGroups,
} from '../../config/constants/fortnite/world-info'

import { isEvoMat } from '../validations/resources'
import { assets } from '../repository'
import { parseModifier, parseResource } from './resources'

const enableTmpModifiers = false

export function worlInfoParser(data: WorldInfoData | null) {
  const rawWorldInfo: Record<
    string,
    {
      alerts: Record<
        string,
        WorldInfoData['missionAlerts'][number]['availableMissionAlerts']
      >
      missions: Record<
        string,
        WorldInfoData['missions'][number]['availableMissions']
      >
      zones: Record<string, Array<number>>
    }
  > = {}
  let worldInfo: WorldInfo = new Collection()

  try {
    if (data) {
      const tmpModifiers: Record<
        string,
        Record<
          string,
          {
            alertId: Array<string>
            missionId: Array<string>
            quantity: number
          }
        >
      > = {}

      const availableWorlds: Array<string> = [
        World.Stonewood,
        World.Plankerton,
        World.CannyValley,
        World.TwinePeaks,
      ]
      const checkWorld = (theaterId: string) =>
        rawWorldInfo[theaterId] !== undefined

      data.theaters?.forEach((theater) => {
        const checkAvailability =
          theater.missionRewardNamedWeightsRowName === 'Theater.Phoenix' ||
          availableWorlds.includes(theater.uniqueId)

        if (!checkAvailability) {
          return
        }

        if (!rawWorldInfo[theater.uniqueId]) {
          worldInfo.set(theater.uniqueId as World, new Collection())
          rawWorldInfo[theater.uniqueId] = {
            alerts: {},
            missions: {},
            zones: {},
          }

          if (enableTmpModifiers) {
            tmpModifiers[theater.uniqueId] = {}
          }
        }

        theater.regions?.forEach((region) => {
          const validRegion = !['mission', 'outpost'].includes(
            region.uniqueId.toLowerCase(),
          )

          if (!validRegion) {
            return
          }

          const rawZone =
            region.missionData?.difficultyWeights?.[0]?.difficultyInfo?.rowName?.trim()

          if (typeof rawZone === 'string' && rawZone.length > 0) {
            const zone = rawZone
              .replace('Theater_', '')
              .replace('_Group', '')
            const newZone =
              zone === WorldStormKingZone.CannyValley
                ? 'Hard_Zone5'
                : zone === WorldStormKingZone.TwinePeaks
                  ? 'Endgame_Zone5'
                  : zone

            if (newZone && newZone !== '') {
              if (!rawWorldInfo[theater.uniqueId].zones[newZone]) {
                rawWorldInfo[theater.uniqueId].alerts[newZone] = []
                rawWorldInfo[theater.uniqueId].missions[newZone] = []
                rawWorldInfo[theater.uniqueId].zones[newZone] = []
              }

              rawWorldInfo[theater.uniqueId].zones[newZone] = [
                ...new Set([
                  ...rawWorldInfo[theater.uniqueId].zones[newZone],
                  ...region.tileIndices,
                ]),
              ]
            }
          }
        })
      })

      data.missions?.forEach((mission) => {
        if (!checkWorld(mission.theaterId)) {
          return
        }

        const availableMissions = mission.availableMissions ?? []

        availableMissions.forEach((currentMission) => {
          Object.entries(rawWorldInfo[mission.theaterId].zones).forEach(
            ([zone, tileIndices]) => {
              if (tileIndices.includes(currentMission.tileIndex)) {
                rawWorldInfo[mission.theaterId].missions[zone].push(
                  currentMission,
                )
              }
            },
          )
        })
      })

      data.missionAlerts?.forEach((alert) => {
        if (!checkWorld(alert.theaterId)) {
          return
        }

        const availableMissionAlerts = alert.availableMissionAlerts ?? []

        availableMissionAlerts.forEach((currentAlert) => {
          Object.entries(rawWorldInfo[alert.theaterId].zones).forEach(
            ([zone, tileIndices]) => {
              if (tileIndices.includes(currentAlert.tileIndex)) {
                rawWorldInfo[alert.theaterId].alerts[zone].push(
                  currentAlert,
                )
              }
            },
          )
        })
      })

      Object.entries(rawWorldInfo).forEach(([theaterId, data]) => {
        Object.entries(data.missions).forEach(([zone, missions]) => {
          const theater = worldInfo.get(theaterId as World)

          if (!theater) {
            return
          }

          missions.forEach((mission) => {
            const zoneInfo = zoneParser({
              missionGenerator: mission.missionGenerator,
              theaterId: theaterId as World,
            })

            // if (zoneInfo.type === 'quest') {
            //   return
            // }

            const currentAlert = rawWorldInfo[theaterId].alerts[zone].find(
              (alert) => mission.tileIndex === alert.tileIndex,
            )
            const alert = currentAlert ?? null
            const zoneLetter =
              zoneLetters[theaterId] ?? WorldLetter.Ventures
            const zoneIconUrl =
              zoneLetter === WorldLetter.Ventures
                ? assets('ventures')
                : undefined

            const modifiers =
              alert?.missionAlertModifiers?.items.map((modifier) => {
                if (enableTmpModifiers) {
                  const checkCurrentModifier = modifiersAvailable.some(
                    (existingModifier) =>
                      modifier.itemType.includes(existingModifier),
                  )

                  if (!checkCurrentModifier) {
                    if (!tmpModifiers[theaterId][modifier.itemType]) {
                      tmpModifiers[theaterId][modifier.itemType] = {
                        alertId: [],
                        missionId: [],
                        quantity: 0,
                      }
                    }

                    tmpModifiers[theaterId][modifier.itemType].alertId = [
                      ...tmpModifiers[theaterId][modifier.itemType]
                        .alertId,
                      alert.missionAlertGuid,
                    ]
                    tmpModifiers[theaterId][modifier.itemType].missionId =
                      [
                        ...tmpModifiers[theaterId][modifier.itemType]
                          .missionId,
                        mission.missionGuid,
                      ]
                    tmpModifiers[theaterId][modifier.itemType].quantity +=
                      1
                  }
                }

                return parseModifier(modifier.itemType)
              }) ?? []

            const powerLevel =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (worldPowerLevel as any)[theaterId]?.[zone] ??
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (worldPowerLevel.ventures as any)?.[zone] ??
              -1

            const filters: Array<string> = []

            const alertRewards = alert?.missionAlertRewards.items
              .reduce(
                (accumulator, current) => {
                  const itemIndex = accumulator.findIndex(
                    (item) => item.itemType === current.itemType,
                  )

                  if (itemIndex >= 0) {
                    accumulator[itemIndex].quantity += current.quantity
                  } else {
                    accumulator.push(current)
                  }

                  return accumulator
                },
                [] as typeof alert.missionAlertRewards.items,
              )
              .map((item) => {
                const parsedResource = parseResource({
                  context: 'world-info',
                  key: item.itemType,
                  quantity: item.quantity,
                })

                filters.push(parsedResource.itemType)

                if (item.attributes?.Alteration?.LootTierGroup) {
                  filters.push(item.attributes?.Alteration?.LootTierGroup)
                } else if (
                  item.itemType.includes('floor_tar') ||
                  item.itemType.includes('floor_ward')
                ) {
                  filters.push(
                    `AlterationTG.Trap.${parsedResource.rarity.toUpperCase()}`,
                  )
                }

                return {
                  imageUrl: parsedResource.imgUrl,
                  itemId: parsedResource.itemType,
                  quantity: item.quantity ?? 1,
                  rarity: parsedResource.rarity,
                  type: parsedResource.type,
                } as WorldInfoMission['ui']['alert']['rewards'][number]
              })

            const missionRewards = mission.missionRewards.items
              .reduce(
                (accumulator, current) => {
                  const itemIndex = accumulator.findIndex(
                    (item) => item.itemType === current.itemType,
                  )

                  if (itemIndex >= 0) {
                    accumulator[itemIndex].quantity += current.quantity
                  } else {
                    accumulator.push(current)
                  }

                  return accumulator
                },
                [] as typeof mission.missionRewards.items,
              )
              .map((item) => {
                const parsedResource = parseResource({
                  context: 'world-info',
                  key: item.itemType,
                  quantity: item.quantity,
                })
                let isBad = false

                filters.push(parsedResource.itemType)

                if (
                  isEvoMat(parsedResource.itemType) &&
                  worldPowerLevel[World.TwinePeaks].Endgame_Zone6 ===
                    powerLevel
                ) {
                  isBad = !(
                    parsedResource.itemType.endsWith('_veryhigh') ||
                    parsedResource.itemType.endsWith('_extreme')
                  )
                }

                return {
                  isBad,
                  imageUrl: parsedResource.imgUrl,
                  itemId: parsedResource.itemType,
                  key: parsedResource.key,
                  quantity: item.quantity ?? 1,
                }
              })

            theater.set(mission.missionGuid, {
              raw: {
                alert,
                mission,
              },

              filters,

              ui: {
                alert: {
                  rewards: alertRewards ?? [],
                },
                mission: {
                  modifiers,
                  rewards: missionRewards,
                  zone: {
                    color: zoneColors[theaterId] ?? WorldColor.Ventures,
                    iconUrl: zoneIconUrl,
                    letter: zoneLetter,
                    theme: {
                      id: zoneInfo.theme,
                      generator: zoneInfo.generator,
                      isGroup: zoneInfo.isGroup,
                    },
                    type: {
                      id: zoneInfo.type as
                        | keyof typeof zonesCategories
                        | 'unknown',
                      imageUrl: zoneInfo.imageUrl,
                    },
                  },
                },
                powerLevel,
              },
            })
          })

          worldInfo.set(
            theaterId as World,
            theater.toSorted((missionA, missionB) => {
              const missionAGroup = missionA.raw.mission.missionGenerator
                .toLowerCase()
                .includes('group')
                ? 1
                : 0
              const missionBGroup = missionB.raw.mission.missionGenerator
                .toLowerCase()
                .includes('group')
                ? 1
                : 0
              const isGroup = missionBGroup - missionAGroup

              const missionAAlert = missionA.raw.alert !== null ? 1 : 0
              const missionBAlert = missionB.raw.alert !== null ? 1 : 0
              const hasAlert = missionBAlert - missionAAlert

              const missionAPowerLevel = missionA.ui.powerLevel
              const missionBPowerLevel = missionB.ui.powerLevel
              const comparePowerLevel =
                missionBPowerLevel - missionAPowerLevel

              return comparePowerLevel || isGroup || hasAlert
            }),
          )
        })
      })

      worldInfo = new Collection(
        worldInfo
          .entries()
          .toArray()
          .toSorted(([theaterA], [theaterB]) => {
            const tmpOrderA =
              worldInfoOrdering[theaterA as keyof typeof worldInfoOrdering]
            const tmpOrderB =
              worldInfoOrdering[theaterB as keyof typeof worldInfoOrdering]

            const orderA = tmpOrderA ?? -1
            const orderB = tmpOrderB ?? -1

            return orderA - orderB
          }),
      )

      if (enableTmpModifiers) {
        console.log('tmpModifiers ->', tmpModifiers)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    //
  }

  return {
    worldInfo: worldInfo,
    parsed: rawWorldInfo,
    raw: data,
  }
}

export function zoneParser({
  missionGenerator,
  theaterId,
}: {
  missionGenerator: string
  theaterId: World
}): {
  isGroup: boolean
  imageUrl: string
  generator: string
  theme: string
  type: keyof typeof zonesCategories | 'unknown'
} {
  const generator = `${missionGenerator}`.trim()
  const current = Object.entries(zonesCategories).find(([, patterns]) =>
    patterns.some((pattern) => generator.includes(pattern)),
  )

  if (current) {
    const [key] = current
    const newKey =
      theaterId === World.Stonewood && key === 'ets' ? 'rescue' : key
    const isGroup =
      theaterId === World.Stonewood && newKey === 'rescue'
        ? false
        : generator.toLowerCase().includes('group')

    return {
      isGroup,
      generator,
      // imageUrl:
      //   isGroup &&
      //   zonesGroups.includes(key as keyof typeof zonesCategories)
      //     ? assets(`${key}-group`)
      //     : assets(`${key}`),
      imageUrl:
        theaterId === World.Stonewood && key === 'ets'
          ? assets('rescue')
          : isGroup &&
              zonesGroups.includes(key as keyof typeof zonesCategories)
            ? assets(`${key}-group`)
            : assets(`${key}`),
      theme: 'unknown',
      type: newKey as keyof typeof zonesCategories | 'unknown',
    }
  }

  return {
    generator,
    isGroup: false,
    imageUrl: assets('question'),
    theme: 'unknown',
    type: 'unknown',
  }
}
