import type { Settings } from '../../types/settings'

import { create } from 'zustand'

export type SettingsState = Settings & {
  updateSettings: (settings: Partial<Settings>) => void
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  path: '',

  updateSettings: (settings) => set(settings),
}))
