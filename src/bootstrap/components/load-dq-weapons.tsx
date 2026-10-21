import { useEffect } from 'react'

import { useDqWeaponsStore } from '../../state/stw-operations/dq-weapons'

export function LoadDqWeapons() {
  useEffect(() => {
    const listener = window.electronAPI.notificationDqWeapons(
      async (value) => {
        const store = useDqWeaponsStore.getState()
        store.setLoading(false)
        store.setResults(value)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationDqWeaponsFavorite(
      async () => {
        const store = useDqWeaponsStore.getState()
        store.setFavoriting(false)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
