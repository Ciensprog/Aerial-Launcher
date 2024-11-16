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
              mission.filters.some((fitlerKey) => {
                const ratityValidation =
                  fitlerKey.includes(`_${rarity}_`) ||
                  fitlerKey.endsWith(`_${rarity}`)

                return fitlerKey.includes('currency_mtxswap') ||
                  fitlerKey.includes('Worker') ||
                  fitlerKey.includes('Hero') ||
                  fitlerKey.includes('Schematic')
                  ? ratityValidation
                  : false
              })
            )
          }

          if (!checkRarities) {
            return false
          }

          if (rewards.length > 0) {
            return rewards.some((key) =>
              mission.filters.some((fitlerKey) => fitlerKey.includes(key))
            )
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
