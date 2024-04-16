import type { AccountData } from '../../types/accounts'

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAccountListStore } from '../../state/accounts/list'

/**
 * [START] Temp functionality
 */
const wait = async () => {
  const timers = Array.from(Array(10), (_, index) => 1000 + 200 * index)
  const current = timers[Math.floor(Math.random() * timers.length)]

  await new Promise((resolve) => setTimeout(resolve, current))
}

export const requestData = async (account: AccountData) => {
  await wait()

  const providers = ['BattlEye', 'EasyAntiCheatEOS', null] as const
  const provider = providers[Math.floor(Math.random() * providers.length)]
  const tokens = ['8tfvc1t24d5g', '28utyg185g4y', null] as const
  const token = tokens[Math.floor(Math.random() * tokens.length)]

  return {
    provider,
    token,
    accountId: account.accountId,
  }
}
/**
 * [END] Temp functionality
 */

export function LoadAccounts() {
  const { addOrUpdate, changeSelected, register } = useAccountListStore(
    useShallow((state) => ({
      addOrUpdate: state.addOrUpdate,
      changeSelected: state.changeSelected,
      register: state.register,
    }))
  )

  useEffect(() => {
    const listener = window.electronAPI.onAccountsLoaded(
      async (accounts) => {
        const accountsToArray = Object.values(accounts)

        register(accounts)

        if (accountsToArray[0]) {
          changeSelected(accountsToArray[0].accountId)
        }

        Object.values(accounts).forEach((account) => {
          requestData(account)
            .then((response) => {
              addOrUpdate(response.accountId, {
                ...account,
                provider: response.provider ?? null,
                token: response.token ?? null,
              })
            })
            .catch(() => {
              addOrUpdate(account.accountId, {
                ...account,
                provider: null,
                token: null,
              })
            })
        })
      }
    )

    window.electronAPI.requestAccounts()

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
