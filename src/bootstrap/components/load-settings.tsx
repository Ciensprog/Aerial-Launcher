import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import { useLanguage } from '../../hooks/language'

import { useCustomizableMenuSettingsStore } from '../../state/settings/customizable-menu'
import {
  useDevSettingsStore,
  useSettingsStore,
} from '../../state/settings/main'

export function LoadSettings() {
  const { i18n } = useTranslation()

  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const updateDevSettings = useDevSettingsStore(
    (state) => state.updateDevSettings
  )
  const syncMenuOptions = useCustomizableMenuSettingsStore(
    (state) => state.syncMenuOptions
  )
  const { updateLanguage } = useLanguage()

  useEffect(() => {
    const listener = window.electronAPI.appLanguageNotification(
      async (data) => {
        updateLanguage(data.generatedFile ? data.language : null)

        if (data.generatedFile) {
          i18n.changeLanguage(data.language)
        }
      }
    )

    window.electronAPI.requestAppLanguage()

    return () => {
      listener.removeListener()
    }
  }, [])

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
