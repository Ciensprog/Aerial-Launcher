import type { ChangeEventHandler } from 'react'
import type { WorldInfo } from '../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { usePagination } from '@mantine/hooks'
import { useRef } from 'react'

import {
  worldNameByTheaterId,
  zonesCategories,
} from '../../../config/constants/fortnite/world-info'

import { useWorldInfo } from '../../../hooks/advanced-mode/world-info'
import { useAlertsOverviewFiltersData } from '../../../hooks/alerts/filters'
import { useAlertsOverviewPaginationData } from '../../../hooks/alerts/overview'

import { sortRewardsSummary } from '../../../lib/parsers/resources'
import { imgResources, imgWorld } from '../../../lib/repository'

function isVentureZone(theaterId: string) {
  const keys = Object.keys(worldNameByTheaterId)

  return !keys.includes(theaterId)
}

export function useAlertsOverviewData() {
  const $inputSearch = useRef<HTMLInputElement>(null)
  const { data, isFetching, isReloading } = useWorldInfo()
  const {
    inputSearch,
    missionTypes,
    rarities,
    rewards,
    zones,
    group,
    changeInputSearch,
  } = useAlertsOverviewFiltersData()

  const filteredData = data
    .entries()
    .reduce((accumulator, [theaterId, missions]) => {
      const checkZone =
        zones.length > 0
          ? zones.includes('ventures')
            ? isVentureZone(theaterId) || zones.includes(theaterId)
            : zones.includes(theaterId)
          : true

      if (checkZone) {
        const tmpMissions = missions.filter((mission) => {
          let checkGroupMission: boolean = true

          if (group) {
            checkGroupMission = mission.ui.mission.zone.theme.isGroup
          }

          if (!checkGroupMission) {
            return false
          }

          let checkMissionTypes: boolean = true

          if (missionTypes.length > 0) {
            checkMissionTypes = missionTypes.some((missionType) => {
              const missionTypeKeys =
                zonesCategories[
                  missionType as keyof typeof zonesCategories
                ]

              return missionTypeKeys.some((key) =>
                mission.raw.mission.missionGenerator.includes(key)
              )
            })
          }

          if (!checkMissionTypes) {
            return false
          }

          let checkRarities: boolean = true

          if (rarities.length > 0) {
            checkRarities = rarities.some((rarity) =>
              mission.filters.some((filterKey) => {
                const ratityValidation =
                  filterKey.includes(`_${rarity}_`) ||
                  filterKey.endsWith(`_${rarity}`)

                return filterKey.includes('currency_mtxswap') ||
                  filterKey.includes('Worker') ||
                  filterKey.includes('Hero') ||
                  filterKey.includes('Defender') ||
                  filterKey.includes('Schematic')
                  ? ratityValidation
                  : false
              })
            )
          }

          if (!checkRarities) {
            return false
          }

          if (rewards.length > 0) {
            return rewards.some((key) => {
              const isCommandSection =
                key === 'Defender' ||
                key === 'Hero' ||
                key === 'Worker' ||
                key === 'Manager'
              const isArsenalSection =
                key === 'Melee' || key === 'Ranged' || key === 'Trap'

              return mission.filters.some((filterKey) => {
                if (key === 'Manager') {
                  return filterKey.startsWith('Worker:manager')
                }

                if (isCommandSection) {
                  return filterKey.startsWith(key)
                }

                if (isArsenalSection) {
                  return filterKey.includes(key)
                }

                return filterKey.includes(key.toLowerCase())
              })
            })
          }

          const valueToSearch = inputSearch.trim()

          if (valueToSearch.length > 0) {
            const tileIndexFilter =
              `${mission.raw.mission.tileIndex}`.includes(valueToSearch)
            const missionAlertGuidFilter =
              mission.raw.alert?.missionAlertGuid.includes(valueToSearch)
            const missionGuidFilter =
              mission.raw.mission.missionGuid.includes(valueToSearch)

            const byFilters = mission.filters.some((key) => {
              const validation = key
                .toLowerCase()
                .includes(valueToSearch.toLowerCase())

              return validation
            })

            const validation =
              (mission.raw.alert
                ? missionAlertGuidFilter ||
                  missionGuidFilter ||
                  tileIndexFilter
                : missionGuidFilter || tileIndexFilter) || byFilters

            return validation
          }

          return true
        })

        accumulator.set(theaterId, tmpMissions)
      }

      return accumulator
    }, new Collection() as WorldInfo)
    .filter((missions) => missions.size > 0)

  const tmpAlertRewards = filteredData.reduce(
    (accumulator, missions) => {
      missions.forEach((mission) => {
        if (mission.raw.alert) {
          mission.ui.alert.rewards.forEach((reward) => {
            const { itemId } = reward

            if (
              itemId.startsWith('AccountResource:') ||
              itemId.startsWith('Ingredient:')
            ) {
              if (!accumulator[reward.itemId]) {
                accumulator[reward.itemId] = {
                  imageUrl: reward.imageUrl,
                  quantity: 0,
                }
              }

              accumulator[reward.itemId].quantity += reward.quantity
            } else {
              const itemPrefix = itemId.split(':')[0]

              if (!accumulator[itemPrefix]) {
                const images: Record<string, string> = {
                  Defender: imgResources('voucher_generic_defender.png'),
                  Hero: imgResources('voucher_generic_hero.png'),
                  Schematic: imgResources(
                    'voucher_generic_schematic_r.png'
                  ),
                  Worker: imgResources('voucher_generic_worker.png'),
                }

                accumulator[itemPrefix] = {
                  imageUrl: images[itemPrefix] ?? imgWorld('question.png'),
                  quantity: 0,
                }
              }

              accumulator[itemPrefix].quantity += reward.quantity
            }
          })
        }
      })

      return accumulator
    },
    {} as Record<
      string,
      {
        imageUrl: string
        quantity: number
      }
    >
  )
  const alertRewards = sortRewardsSummary(tmpAlertRewards)

  const onChangeInputSearch: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    changeInputSearch(event.currentTarget.value.replace(/\s+/g, ' '))
  }

  const clearInputSearch = () => {
    changeInputSearch('')
    $inputSearch.current?.focus()
  }

  return {
    $inputSearch,
    data: filteredData,
    inputSearch,
    loading: {
      isFetching,
      isReloading,
    },
    alertRewards,
    clearInputSearch,
    onChangeInputSearch,
  }
}

export function useZoneMissionsPagination({
  id,
  total,
}: {
  id: string
  total: number
}) {
  const perPage = 10
  const totalPages = Math.ceil(total / perPage)

  const { page, setPage } = useAlertsOverviewPaginationData({ id })
  const pagination = usePagination({
    page,
    total: totalPages,
    onChange: setPage,
  })

  return { pagination, perPage, totalPages }
}
