import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAutoLlamaStore } from '../../state/stw-operations/auto/llamas'

export function LoadAutoLlamas() {
  const { addAccounts } = useAutoLlamaStore(
    useShallow((state) => ({
      addAccounts: state.addAccounts,
    }))
  )

  useEffect(() => {
    const listener = window.electronAPI.autoLlamasLoadAccountsResponse(
      async (accounts) => {
        addAccounts(accounts)
      }
    )

    window.electronAPI.autoLlamasLoadAccounts()

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
