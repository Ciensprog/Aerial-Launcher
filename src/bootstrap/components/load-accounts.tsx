import type { AccountData } from '../../types/accounts'

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAccountListStore } from '../../state/accounts/list'

export function LoadAccounts() {
  const { accounts, addOrUpdate, changeSelected, register } =
    useAccountListStore(
      useShallow((state) => ({
        accounts: state.accounts,
        addOrUpdate: state.addOrUpdate,
        changeSelected: state.changeSelected,
        register: state.register,
      }))
    )

  useEffect(() => {
    const accountsLoaderListener = window.electronAPI.onAccountsLoaded(
      async (accounts) => {
        const accountsToArray = Object.values(accounts)

        register(accounts)

        if (accountsToArray[0]) {
          changeSelected(accountsToArray[0].accountId)
        }
      }
    )

    window.electronAPI.requestAccounts()

    return () => {
      accountsLoaderListener.removeListener()
    }
  }, [])

  useEffect(() => {
    const syncAccessTokenListener = window.electronAPI.syncAccountData(
      async ({ accountId, data }) => {
        addOrUpdate(accountId, data as AccountData)
      }
    )

    return () => {
      syncAccessTokenListener.removeListener()
    }
  }, [accounts])

  return null
}
