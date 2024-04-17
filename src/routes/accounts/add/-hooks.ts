import type { MouseEventHandler } from 'react'
import type { AuthCallbackResponseParam } from '../../../types/preload'

import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { epicGamesAuthorizationCodeURL } from '../../../config/fortnite/links'

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
  fetcher: (
    callback: (response: AuthCallbackResponseParam) => Promise<void>
  ) => {
    removeListener: () => Electron.IpcRenderer
  }
}) {
  const { changeSelected, register } = useAccountListStore(
    useShallow((state) => ({
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

        window.electronAPI.requestProviderAndAccessToken(
          data.currentAccount
        )

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
