import type { DevSettings, Settings } from '../../types/settings'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type SettingsState = Settings & {
  customProcessIsRunning: boolean

  updateSettings: (settings: Partial<Settings>) => void
  updateCustomProcessStatus: (value: boolean) => void
}

export type DevSettingsState = {
  settings: DevSettings

  updateDevSettings: (value: DevSettings) => void
}

export const useSettingsStore = create<SettingsState>()(
  immer((set) => ({
    claimingRewards: '',
    customProcess: '',
    missionInterval: '',
    path: '',
    systemTray: false,
    userAgent: '',

    customProcessIsRunning: false,

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
        set((state) => ({
          ...state,
          ...settings,
        }))
      }
    },
    updateCustomProcessStatus: (isRunning) => {
      set((state) => {
        state.customProcessIsRunning = isRunning
      })
    },
  }))
)

export const useDevSettingsStore = create<DevSettingsState>()((set) => ({
  settings: {},

  updateDevSettings: (settings) => set({ settings }),
}))
