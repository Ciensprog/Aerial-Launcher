import { useEffect } from 'react'

import { useAccountInfoStore } from '../../state/stw-operations/account-info'

export function LoadAccountInfo() {
  useEffect(() => {
    const listener = window.electronAPI.notificationAccountInfo(
      async (value) => {
        const store = useAccountInfoStore.getState()
        store.setLoading(false)
        store.setResults(value)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationAccountInfoAction(
      async (value) => {
        const store = useAccountInfoStore.getState()
        store.setActing(false)

        if (value.data) {
          store.setResults(
            store.results.map((item) =>
              item.accountId === value.data?.accountId ? value.data : item
            )
          )
        }
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
