import type { CustomizableMenuSettings } from '../../types/settings'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export type CustomizableMenuSettingsState = {
  data: CustomizableMenuSettings

  syncMenuOptions: (data: CustomizableMenuSettings) => void
  updateMenuOption: (
    key: keyof CustomizableMenuSettings
  ) => (visibility: boolean) => void
}

export const customizableMenuSettingsRelations: Record<
  keyof Pick<
    CustomizableMenuSettings,
    'stwOperations' | 'accountManagement' | 'advancedMode' | 'myAccounts'
  >,
  Array<
    keyof Omit<
      CustomizableMenuSettings,
      'stwOperations' | 'accountManagement' | 'advancedMode' | 'myAccounts'
    >
  >
> = {
  stwOperations: [
    'autoKick',
    'party',
    'saveQuests',
    'homebaseName',
    'xpBoosts',
    'autoPinUrns',
  ],
  accountManagement: [
    'vbucksInformation',
    'redeemCodes',
    'devicesAuth',
    'epicGamesSettings',
    'eula',
  ],
  advancedMode: ['matchmakingTrack', 'worldInfo'],
  myAccounts: [
    'authorizationCode',
    'exchangeCode',
    'deviceAuth',
    'removeAccount',
  ],
}

export const useCustomizableMenuSettingsStore =
  create<CustomizableMenuSettingsState>()(
    immer((set) => ({
      data: {},

      syncMenuOptions: (data) => {
        set({ data })
      },
      updateMenuOption: (key) => (visibility) => {
        set((state) => {
          state.data[key] = visibility

          window.electronAPI.customizableMenuDataUpdate(key, visibility)
        })
      },
    }))
  )
