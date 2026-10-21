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
    autoDailyQuests: true,
    claimingRewards: '',
    customProcess: '',
    missionInterval: '',
    path: '',
    epicGamesDir: 'C:\\Program Files\\Epic Games',
    epicGamesExtraDirs: [],
    systemTray: false,
    userAgent: '',
    customProxyEnabled: false,
    customProxyPort: '8080',

    customProcessIsRunning: false,

    updateSettings: (settings) => {
      const newData: Partial<Settings> = {}

      if (settings.autoDailyQuests !== undefined) {
        newData.autoDailyQuests = settings.autoDailyQuests
      }

      if (settings.claimingRewards !== undefined) {
        newData.claimingRewards = settings.claimingRewards
      }

      if (settings.missionInterval !== undefined) {
        newData.missionInterval = settings.missionInterval
      }

      if (settings.path !== undefined) {
        newData.path = settings.path
      }

      if (settings.epicGamesDir !== undefined) {
        newData.epicGamesDir = settings.epicGamesDir
      }

      if (settings.epicGamesExtraDirs !== undefined) {
        newData.epicGamesExtraDirs = settings.epicGamesExtraDirs
      }

      if (settings.systemTray !== undefined) {
        newData.systemTray = settings.systemTray
      }

      if (settings.userAgent !== undefined) {
        newData.userAgent = settings.userAgent
      }

      if (settings.customProxyEnabled !== undefined) {
        newData.customProxyEnabled = settings.customProxyEnabled
      }

      if (settings.customProxyPort !== undefined) {
        newData.customProxyPort = settings.customProxyPort
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
