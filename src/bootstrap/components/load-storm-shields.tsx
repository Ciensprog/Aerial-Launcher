import { useEffect } from 'react'

import { useStormShieldsStore } from '../../state/stw-operations/storm-shields'

export function LoadStormShields() {
  useEffect(() => {
    const listener = window.electronAPI.notificationStormShields(
      async (value) => {
        const store = useStormShieldsStore.getState()
        store.setLoading(false)
        store.setResults(value)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
