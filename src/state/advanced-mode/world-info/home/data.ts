import type { WorldInfo } from '../../../../types/data/advanced-mode/world-info'
import type { WorldInfoData } from '../../../../types/services/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { create } from 'zustand'

export type WorldInfoState = {
  data: WorldInfo
  rawData: WorldInfoData | null
  isFetching: boolean
  isReloading: boolean

  setWorldInfoData: (value: WorldInfo) => void
  setRawWorldInfoData: (value: WorldInfoData | null) => void
  updateWorldInfoLoading: (
    key: 'isFetching' | 'isReloading',
    value: boolean
  ) => void
}

export const useWorldInfoStore = create<WorldInfoState>()((set) => ({
  data: new Collection(),
  rawData: null,
  isFetching: false,
  isReloading: false,

  setWorldInfoData: (data) => set({ data }),
  setRawWorldInfoData: (rawData) => set({ rawData }),
  updateWorldInfoLoading: (key, value) => set({ [key]: value }),
}))
