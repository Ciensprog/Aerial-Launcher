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

        Object.values(accounts).forEach((account) => {
          window.electronAPI.requestProviderAndAccessToken(account)
        })
      }
    )
    const acProviderListener =
      window.electronAPI.responseProviderAndAccessToken(
        async ({ account, data }) => {
          addOrUpdate(account.accountId, {
            ...account,
            provider: data?.provider ?? null,
            token: data?.accessToken ?? null,
          })
        }
      )

    window.electronAPI.requestAccounts()

    return () => {
      accountsLoaderListener.removeListener()
      acProviderListener.removeListener()
    }
  }, [])

  useEffect(() => {
    const scheduleRequestAccountsListener =
      window.electronAPI.scheduleRequestAccounts(async () => {
        const accountsToArray: Array<AccountData> = Object.values(accounts)

        window.electronAPI.scheduleResponseAccounts(accountsToArray)
      })
    const scheduleResponseProvidersListener =
      window.electronAPI.scheduleResponseProviders(
        async ({ account, data }) => {
          addOrUpdate(account.accountId, {
            ...account,
            provider: data?.provider ?? null,
            token: data?.accessToken ?? null,
          })
        }
      )

    return () => {
      scheduleRequestAccountsListener.removeListener()
      scheduleResponseProvidersListener.removeListener()
    }
  }, [accounts])

  return null
}
