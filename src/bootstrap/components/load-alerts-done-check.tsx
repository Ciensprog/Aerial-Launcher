import { useEffect } from 'react'

import { useAlertsDoneCheckStore } from '../../state/alerts/alerts-done-check'

export function LoadAlertsDoneCheck() {
  useEffect(() => {
    const listener = window.electronAPI.notificationAlertsDoneCheck(
      async (value) => {
        const store = useAlertsDoneCheckStore.getState()
        store.setLoading(false)
        store.setResults(value)
      },
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
