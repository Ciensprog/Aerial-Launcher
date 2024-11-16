import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type FilterKeys = 'zones' | 'missionTypes' | 'rarities' | 'rewards'

export type AlertsOverviewFiltersState = {
  inputSearch: string

  zones: Array<string>
  missionTypes: Array<string>
  rarities: Array<string>
  rewards: Array<string>

  changeInputSearch: (value: string) => void
  resetFilters: () => void
  toggleFilterKeys: (type: FilterKeys) => (keys: Array<string>) => void
}

export const useAlertsOverviewFiltersStore =
  create<AlertsOverviewFiltersState>()(
    immer((set) => ({
      inputSearch: '',

      zones: [],
      missionTypes: [],
      rarities: [],
      rewards: [],

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
    }))
  )
