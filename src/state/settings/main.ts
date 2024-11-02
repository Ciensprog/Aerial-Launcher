import type { DevSettings, Settings } from '../../types/settings'

import { create } from 'zustand'

export type SettingsState = Settings & {
  updateSettings: (settings: Partial<Settings>) => void
}

export type DevSettingsState = {
  settings: DevSettings

  updateDevSettings: (value: DevSettings) => void
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  claimingRewards: '',
  missionInterval: '',
  path: '',
  systemTray: false,
  userAgent: '',

  updateSettings: (settings) => {
    const newData: Partial<
      Record<keyof Settings, boolean | number | string>
    > = {}

    if (settings.claimingRewards !== undefined) {
      newData.claimingRewards = settings.claimingRewards
    }

    if (settings.missionInterval !== undefined) {
      newData.missionInterval = settings.missionInterval
    }

    if (settings.path !== undefined) {
      newData.path = settings.path
    }

    if (settings.systemTray !== undefined) {
      newData.systemTray = settings.systemTray
    }

    if (settings.userAgent !== undefined) {
      newData.userAgent = settings.userAgent
    }

    const total = Object.keys(newData).length

    if (total > 0) {
      set(settings)
    }
  },
}))

export const useDevSettingsStore = create<DevSettingsState>()((set) => ({
  settings: {},

  updateDevSettings: (settings) => set({ settings }),
}))
