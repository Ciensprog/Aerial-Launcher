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

  updateData: (value: AlertsDoneSearchPlayerResponse | null) => void
}

export const useAlertsDoneFormStore = create<AlertsDoneFormState>()(
  immer((set) => ({
    inputSearch: '',
    searchIsSubmitting: false,

    changeInputSearch: (inputSearch) => set({ inputSearch }),
    updateSearchIsSubmitting: (value) =>
      set({ searchIsSubmitting: value }),
  }))
)

export const useAlertsDonePlayerStore = create<AlertsDonePlayerState>()(
  immer((set) => ({
    data: null,

    updateData: (data) => set({ data }),
  }))
)
