import { useEffect } from 'react'

import { useSettingsStore } from '../../state/settings/main'

export function LoadSettings() {
  const updateSettings = useSettingsStore((state) => state.updateSettings)

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

  return null
}
