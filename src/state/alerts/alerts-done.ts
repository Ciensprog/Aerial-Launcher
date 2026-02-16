import type { AlertsDoneSearchPlayerResponse } from '../../types/alerts'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type FilterKeys = 'zones' | 'missionTypes' | 'rarities' | 'rewards'

export type AlertsDoneFormState = {
  inputSearch: string
  searchIsSubmitting: boolean

  changeInputSearch: (value: string) => void
  updateSearchIsSubmitting: (value: boolean) => void
}

export type AlertsDonePlayerState = {
  data: AlertsDoneSearchPlayerResponse | null
  marked: Record<string, Record<string, true>>

  updateData: (value: AlertsDoneSearchPlayerResponse | null) => void
  syncMarked: (
    accountId: string,
    data: Record<string, boolean> | null,
  ) => void
}

export const useAlertsDoneFormStore = create<AlertsDoneFormState>()(
  immer((set) => ({
    inputSearch: '',
    searchIsSubmitting: false,

    changeInputSearch: (inputSearch) => set({ inputSearch }),
    updateSearchIsSubmitting: (value) =>
      set({ searchIsSubmitting: value }),
  })),
)

export const useAlertsDonePlayerStore = create<AlertsDonePlayerState>()(
  immer((set) => ({
    data: null,
    marked: {},

    updateData: (data) => set({ data }),
    syncMarked: (accountId, data) => {
      set((state) => {
        if (!state.marked[accountId]) {
          state.marked[accountId] = {}
        }

        if (data === null) {
          state.marked[accountId] = {}

          return
        }

        const { add, remove } = Object.entries(data).reduce(
          (accumulator, [missionGuid, value]) => {
            if (value) {
              accumulator.add[missionGuid] = true
            } else {
              accumulator.remove.push(missionGuid)
            }

            return accumulator
          },
          {
            add: {} as AlertsDonePlayerState['marked'][string],
            remove: [] as Array<string>,
          },
        )

        const newData = Object.entries(state.marked[accountId]).reduce(
          (accumulator, [missionGuid]) => {
            if (!remove.includes(missionGuid)) {
              accumulator[missionGuid] = true
            }

            return accumulator
          },
          {} as AlertsDonePlayerState['marked'][string],
        )

        state.marked[accountId] = {
          ...newData,
          ...add,
        }
      })
    },
  })),
)
