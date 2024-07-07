import type { WorldInfoData } from '../../../types/services/advanced-mode/world-info'

import { create } from 'zustand'

export type CurrentWorldInfoState = {
  data: WorldInfoData | null
  isFetching: boolean

  setData: (value: WorldInfoData | null) => void
  setIsFetching: (value: boolean) => void
}

export const useCurrentWorldInfoStore = create<CurrentWorldInfoState>()(
  (set) => ({
    data: null,
    isFetching: false,

    setData: (data) => set({ data }),
    setIsFetching: (isLoading) => set({ isFetching: isLoading }),
  })
)
