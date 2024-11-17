import type { WorldInfo } from '../../../../types/data/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { create } from 'zustand'

export type WorldInfoState = {
  data: WorldInfo
  isFetching: boolean
  isReloading: boolean

  setWorldInfoData: (value: WorldInfo) => void
  updateWorldInfoLoading: (
    key: 'isFetching' | 'isReloading',
    value: boolean
  ) => void
}

export const useWorldInfoStore = create<WorldInfoState>()((set) => ({
  data: new Collection(),
  isFetching: false,
  isReloading: false,

  setWorldInfoData: (data) => set({ data }),
  updateWorldInfoLoading: (key, value) => set({ [key]: value }),
}))
