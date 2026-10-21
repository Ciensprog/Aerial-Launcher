import type { CustomizableMenuSettings } from '../../types/settings'
import type { MenuCategory, MenuVisibilityKey } from '../../lib/settings/menu-layout'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export type CustomizableMenuSettingsState = {
  data: CustomizableMenuSettings

  syncMenuOptions: (data: CustomizableMenuSettings) => void
  updateMenuOption: (
    key: MenuVisibilityKey,
  ) => (visibility: boolean) => void
  updateMenuLayout: (categories: Array<MenuCategory>) => void
}

export const customizableMenuSettingsRelations: Record<
  keyof Pick<
    CustomizableMenuSettings,
    | 'general'
    | 'stwOperations'
    | 'accountManagement'
    | 'advancedMode'
    | 'myAccounts'
  >,
  Array<
    keyof Omit<
      CustomizableMenuSettings,
      | 'general'
      | 'stwOperations'
      | 'accountManagement'
      | 'advancedMode'
      | 'myAccounts'
      | 'categories'
    >
  >
> = {
  general: [
    'currentAlerts',
    'gamesLauncher',
  ],
  stwOperations: [
    'autoKick',
    'taxiService',
    'party',
    'dailyQuests',
    'dqWeapons',
    'stormShields',
    'xpBoosts',
    'autoPinUrns',
    'llamaManager',
    'itemShop',
    'collectionBook',
    'accountInfo',
  ],
  accountManagement: [
    'vbucksInformation',
    'cloudStorage',
    'accountExport',
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
      updateMenuLayout: (categories) => {
        set((state) => {
          state.data.categories = categories
        })

        window.electronAPI.customizableMenuDataUpdateLayout(categories)
      },
    })),
  )
