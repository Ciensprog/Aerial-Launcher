import { useShallow } from 'zustand/react/shallow'

import {
  FilterKeys,
  useAlertsOverviewFiltersStore,
} from '../../state/alerts/filters'

import { useAlertsOverviewPaginationInit } from './overview'

export function useAlertsOverviewFiltersData() {
  const {
    inputSearch,
    missionTypes,
    rarities,
    rewards,
    zones,
    group,
    changeInputSearch,
  } = useAlertsOverviewFiltersStore(
    useShallow((state) => ({
      inputSearch: state.inputSearch,
      zones: state.zones,
      missionTypes: state.missionTypes,
      rarities: state.rarities,
      rewards: state.rewards,
      group: state.group,

      changeInputSearch: state.changeInputSearch,
    }))
  )

  return {
    inputSearch,
    missionTypes,
    rarities,
    rewards,
    zones,
    group,

    changeInputSearch,
  }
}

export function useAlertsOverviewFiltersActions() {
  const { initPagination } = useAlertsOverviewPaginationInit()
  const { resetFilters, toggleFilterKeys, toggleGroup } =
    useAlertsOverviewFiltersStore(
      useShallow((state) => ({
        resetFilters: () => {
          initPagination([])
          state.resetFilters()
        },
        toggleFilterKeys: (keys: FilterKeys) => (ids: Array<string>) => {
          initPagination([])
          state.toggleFilterKeys(keys)(ids)
        },
        toggleGroup: state.toggleGroup,
      }))
    )

  return {
    resetFilters,
    toggleFilterKeys,
    toggleGroup,
  }
}
