import type { MouseEventHandler } from 'react'
import type { AuthCallbackFunction } from '../../../types/preload'

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { epicGamesAuthorizationCodeURL } from '../../../config/fortnite/links'

import { requestData } from '../../../bootstrap/components/load-accounts'

import { useAccountListStore } from '../../../state/accounts/list'

import { toast } from '../../../lib/notifications'

export function useHandlers() {
  const goToAuthorizationCodeURL: MouseEventHandler<HTMLAnchorElement> = (
    event
  ) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(epicGamesAuthorizationCodeURL)
  }

  return {
    goToAuthorizationCodeURL,
  }
}

export function useBaseSetupForm({
  fetcher,
}: {
  fetcher: (callback: AuthCallbackFunction) => {
    removeListener: () => Electron.IpcRenderer
  }
}) {
  const { addOrUpdate, changeSelected, register } = useAccountListStore(
    useShallow((state) => ({
      addOrUpdate: state.addOrUpdate,
      changeSelected: state.changeSelected,
      register: state.register,
    }))
  )

  useEffect(() => {
    const listener = fetcher(async ({ data, error }) => {
      if (data) {
        const accountsToArray = Object.values(data.accounts)

        register({
          [data.currentAccount.accountId]: data.currentAccount,
        })

        if (accountsToArray.length <= 1) {
          changeSelected(accountsToArray[0].accountId)
        }

        requestData(data.currentAccount)
          .then((response) => {
            addOrUpdate(response.accountId, {
              ...data.currentAccount,
              provider: response.provider ?? null,
              token: response.token ?? null,
            })
          })
          .catch(() => {
            addOrUpdate(data.currentAccount.accountId, {
              ...data.currentAccount,
              provider: null,
              token: null,
            })
          })

        toast(`New account added: ${data.currentAccount.displayName}`)
      } else if (error) {
        toast(error ?? 'Unknown error :c')
      }
    })

    return () => {
      listener.removeListener()
    }
  }, [])
}
