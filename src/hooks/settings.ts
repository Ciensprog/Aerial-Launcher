import type { CustomizableMenuSettings } from '../types/settings'

import { useCallback } from 'react'

import {
  customizableMenuSettingsRelations,
  useCustomizableMenuSettingsStore,
} from '../state/settings/customizable-menu'
import {
  useDevSettingsStore,
  useSettingsStore,
} from '../state/settings/main'

export function useDevSettingsData() {
  const settings = useDevSettingsStore((state) => state.settings)

  return settings
}

/**
 * Menu options hidden until the user turns them on
 * (the menu file only stores options the user has toggled)
 */
const hiddenByDefaultMenuOptions: Array<keyof CustomizableMenuSettings> = [
  // Unlock SSD Rewards no longer works
  'unlock',
]

function getMenuOptionDefault(key: keyof CustomizableMenuSettings) {
  return !hiddenByDefaultMenuOptions.includes(key)
}

export function useCustomizableMenuSettingsVisibility() {
  const data = useCustomizableMenuSettingsStore((state) => state.data)

  const getMenuOptionVisibility = useCallback(
    (key: keyof CustomizableMenuSettings, validateItems?: boolean) => {
      const keyValidation = data[key] ?? getMenuOptionDefault(key)

      if (validateItems) {
        const childItems =
          customizableMenuSettingsRelations[
            key as keyof typeof customizableMenuSettingsRelations
          ]

        if (childItems !== undefined) {
          const childValidations = childItems.map(
            (item) => data[item] ?? getMenuOptionDefault(item),
          )

          return childValidations.includes(true) && keyValidation
        }
      }

      return keyValidation
    },
    [data],
  )

  return {
    getMenuOptionVisibility,
  }
}

export function useCustomizableMenuSettingsActions() {
  const updateMenuOption = useCustomizableMenuSettingsStore(
    (state) => state.updateMenuOption,
  )

  return {
    updateMenuOption,
  }
}

export function useCustomProcessStatus() {
  const customProcessIsRunning = useSettingsStore(
    (state) => state.customProcessIsRunning,
  )

  return {
    customProcessIsRunning,
  }
}
