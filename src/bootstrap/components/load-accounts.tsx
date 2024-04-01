import type { AccountInformationDetailed } from '../../types/accounts'

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAccountListStore } from '../../state/accounts/list'

const wait = async () => {
  const timers = Array.from(Array(10), (_, index) => 1000 + 200 * index)
  const current = timers[Math.floor(Math.random() * timers.length)]

  await new Promise((resolve) => setTimeout(resolve, current))
}

const requestProvider = async (account: AccountInformationDetailed) => {
  await wait()

  const providers = ['BattlEye', 'EasyAntiCheatEOS', null] as const
  const current = providers[Math.floor(Math.random() * providers.length)]

  return {
    accountId: account.accountId,
    provider: current,
  }
}

export function LoadAccounts() {
  const { addOrUpdate, changeSelected, register } = useAccountListStore(
    useShallow((state) => ({
      addOrUpdate: state.addOrUpdate,
      changeSelected: state.changeSelected,
      register: state.register,
    }))
  )

  useEffect(() => {
    window.electronAPI.onAccountsLoaded(async (accounts) => {
      const accountsToArray = Object.values(accounts)

      register(accounts)

      if (accountsToArray[0]) {
        changeSelected(accountsToArray[0].accountId)
      }

      Object.values(accounts).forEach((account) => {
        requestProvider(account)
          .then((response) => {
            addOrUpdate(response.accountId, {
              ...account,
              provider: response.provider ?? null,
            })
          })
          .catch(() => {
            addOrUpdate(account.accountId, {
              ...account,
              provider: null,
            })
          })
      })
    })

    window.electronAPI.requestAccounts()
  }, [])

  return null
}
