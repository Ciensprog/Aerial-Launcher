import { useEffect } from 'react'

import { useAccountExportStore } from '../../state/account-management/account-export'

export function LoadAccountExport() {
  useEffect(() => {
    const listener = window.electronAPI.notificationAccountExport(
      async (value) => {
        const store = useAccountExportStore.getState()

        store.setExporting(false)

        if (!value.canceled) {
          store.setResults(value.results, value.directory)
        }
      },
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
