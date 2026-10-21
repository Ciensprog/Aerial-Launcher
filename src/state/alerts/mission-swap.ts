import type { WorldInfo } from '../../types/data/advanced-mode/world-info'
import type { WorldInfoData } from '../../types/services/advanced-mode/world-info'

import { Collection } from '@discordjs/collection'
import { create } from 'zustand'

export type MissionSwapState = {
  yesterdayFilename: string
  yesterdayPath: string
  yesterdayRaw: WorldInfoData | null
  yesterdayWorldInfo: WorldInfo
  yesterdayManual: boolean
  yesterdayMissing: boolean
  selected: Record<string, boolean>
  onlyDifferent: boolean
  onlyAlerts: boolean
  worldInfoDirectory: string

  clearYesterday: () => void
  setOnlyAlerts: (value: boolean) => void
  setOnlyDifferent: (value: boolean) => void
  setSelected: (selected: Record<string, boolean>) => void
  setWorldInfoDirectory: (value: string) => void
  setYesterdayMissing: (value: boolean) => void
  setYesterday: (value: {
    filename: string
    path: string
    raw: WorldInfoData
    worldInfo: WorldInfo
    manual?: boolean
  }) => void
  toggleSelected: (key: string) => void
}

export const useMissionSwapStore = create<MissionSwapState>()((set) => ({
  yesterdayFilename: '',
  yesterdayPath: '',
  yesterdayRaw: null,
  yesterdayWorldInfo: new Collection(),
  yesterdayManual: false,
  yesterdayMissing: false,
  selected: {},
  onlyDifferent: false,
  onlyAlerts: false,
  worldInfoDirectory: '',

  clearYesterday: () =>
    set({
      yesterdayFilename: '',
      yesterdayPath: '',
      yesterdayRaw: null,
      yesterdayWorldInfo: new Collection(),
      yesterdayManual: true,
      yesterdayMissing: false,
      selected: {},
    }),
  setOnlyAlerts: (onlyAlerts) => set({ onlyAlerts }),
  setOnlyDifferent: (onlyDifferent) => set({ onlyDifferent }),
  setSelected: (selected) => set({ selected }),
  setWorldInfoDirectory: (worldInfoDirectory) => set({ worldInfoDirectory }),
  setYesterdayMissing: (yesterdayMissing) => set({ yesterdayMissing }),
  setYesterday: ({ filename, path, raw, worldInfo, manual = false }) =>
    set({
      yesterdayFilename: filename,
      yesterdayPath: path,
      yesterdayRaw: raw,
      yesterdayWorldInfo: worldInfo,
      yesterdayManual: manual,
      yesterdayMissing: false,
      selected: {},
    }),
  toggleSelected: (key) =>
    set((state) => {
      const selected = { ...state.selected }

      if (selected[key]) {
        delete selected[key]
      } else {
        selected[key] = true
      }

      return { selected }
    }),
}))
