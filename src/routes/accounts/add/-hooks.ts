import type { MouseEventHandler } from 'react'
import type { AuthCallbackResponseParam } from '../../../types/preload'

import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  epicGamesAuthorizationCodeURL,
  epicGamesLoginURL,
} from '../../../config/fortnite/links'

import { useAddAccountUpdateSubmittingState } from '../../../hooks/accounts'

import { AddAccountsLoadingsState } from '../../../state/accounts/add'
import { useAccountListStore } from '../../../state/accounts/list'

import { LauncherAuthError } from '../../../lib/validations/schemas/fortnite/auth'
import { toast } from '../../../lib/notifications'

export function useHandlers() {
  const goToAuthorizationCodeURL: MouseEventHandler<HTMLAnchorElement> = (
    event
  ) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(epicGamesAuthorizationCodeURL)
  }
  const goToEpicGamesLogin: MouseEventHandler<HTMLAnchorElement> = (
    event
  ) => {
    event.preventDefault()
    window.electronAPI.openExternalURL(epicGamesLoginURL)
  }

  return {
    goToAuthorizationCodeURL,
    goToEpicGamesLogin,
  }
}

export function useBaseSetupForm({
  fetcher,
  type,
}: {
  fetcher: (
    callback: (response: AuthCallbackResponseParam) => Promise<void>
  ) => {
    removeListener: () => Electron.IpcRenderer
  }
  type: keyof AddAccountsLoadingsState
}) {
  const { t } = useTranslation(['accounts'], {
    keyPrefix: 'general.notifications.new-account',
  })

  const { updateSubmittingState } =
    useAddAccountUpdateSubmittingState(type)
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

        // window.electronAPI.requestProviderAndAccessToken(
        //   data.currentAccount
        // )

        toast(
          t('success', {
            name: data.currentAccount.displayName,
          })
        )
      } else if (error) {
        const cuystomKeys: Array<string> = [LauncherAuthError.login]

        if (cuystomKeys.includes(error)) {
          toast(t(LauncherAuthError.login))
        } else {
          toast(error ?? t('error'))
        }
      }

      updateSubmittingState(false)
    })

    return () => {
      listener.removeListener()
    }
  }, [])
}
