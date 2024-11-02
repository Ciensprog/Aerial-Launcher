import { useEffect } from 'react'

import { useCustomizableMenuSettingsStore } from '../../state/settings/customizable-menu'
import {
  useDevSettingsStore,
  useSettingsStore,
} from '../../state/settings/main'

export function LoadSettings() {
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const updateDevSettings = useDevSettingsStore(
    (state) => state.updateDevSettings
  )
  const syncMenuOptions = useCustomizableMenuSettingsStore(
    (state) => state.syncMenuOptions
  )

  useEffect(() => {
    const listener = window.electronAPI.responseSettings(
      async (settings) => {
        updateSettings(settings)
      }
    )

    window.electronAPI.requestSettings()

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationDevSettings(
      async (settings) => {
        updateDevSettings(settings)
      }
    )

    window.electronAPI.requestDevSettings()

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationCustomizableMenuData(
      async (data) => {
        syncMenuOptions(data)
      }
    )

    window.electronAPI.requestCustomizableMenuData()

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
