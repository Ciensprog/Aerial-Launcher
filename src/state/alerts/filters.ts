import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type FilterKeys = 'zones' | 'missionTypes' | 'rarities' | 'rewards'

export type AlertsOverviewFiltersState = {
  inputSearch: string

  zones: Array<string>
  missionTypes: Array<string>
  rarities: Array<string>
  rewards: Array<string>
  group: boolean

  changeInputSearch: (value: string) => void
  resetFilters: () => void
  toggleFilterKeys: (type: FilterKeys) => (keys: Array<string>) => void
  toggleGroup: (value: boolean) => void
}

export const useAlertsOverviewFiltersStore =
  create<AlertsOverviewFiltersState>()(
    immer((set) => ({
      inputSearch: '',

      zones: [],
      missionTypes: [],
      rarities: [],
      rewards: [],
      group: false,

      changeInputSearch: (inputSearch) => set({ inputSearch }),
      resetFilters: () => {
        set({
          zones: [],
          missionTypes: [],
          rarities: [],
          rewards: [],
        })
      },
      toggleFilterKeys: (type) => (keys) => {
        set((state) => {
          state[type] = keys
        })
      },
      toggleGroup: (value) => {
        set((state) => {
          state.group = value
        })
      },
    }))
  )
