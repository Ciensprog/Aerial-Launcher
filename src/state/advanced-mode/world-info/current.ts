import type { WorldInfoData } from '../../../types/services/advanced-mode/world-info'

import { create } from 'zustand'

export type CurrentWorldInfoState = {
  data: WorldInfoData | null
  isFetching: boolean
  isSaving: boolean

  setData: (value: WorldInfoData | null) => void
  setIsFetching: (value: boolean) => void
  setIsSaving: (value: boolean) => void
}

export const useCurrentWorldInfoStore = create<CurrentWorldInfoState>()(
  (set) => ({
    data: null,
    isFetching: false,
    isSaving: false,

    setData: (data) => set({ data }),
    setIsFetching: (isFetching) => set({ isFetching }),
    setIsSaving: (isSaving) => set({ isSaving }),
  })
)
