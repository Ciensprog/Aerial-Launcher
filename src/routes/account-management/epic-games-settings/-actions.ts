import type { MouseEventHandler } from 'react'

import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { epicGamesAccountSettingsURL } from '../../../config/fortnite/links'

import { useGetSelectedAccount } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'
import { parseCustomDisplayName } from '../../../lib/utils'

export function useHandlers() {
  const { t } = useTranslation(['account-management'], {
    keyPrefix: 'epic-settings',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [currentCode, setCurrentCode] = useState<string | undefined>()
  const { selected } = useGetSelectedAccount()

  useEffect(() => {
    const listener = window.electronAPI.responseEpicGamesSettings(
      async ({ account, status, code }) => {
        setIsLoading(false)
        setCurrentCode(code)

        toast(
          status
            ? t('notifications.success', {
                name: parseCustomDisplayName(account),
              })
            : t('notifications.error'),
          {
            duration: status ? 6000 : undefined,
          }
        )
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleGenerateCode = () => {
    if (!selected) {
      return
    }

    setIsLoading(true)
    window.electronAPI.openEpicGamesSettings(selected)
  }

  const handleOpenURL: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault()

    if (!selected || !currentCode) {
      return
    }

    window.electronAPI.openExternalURL(
      epicGamesAccountSettingsURL(currentCode)
    )
  }

  const handleCopyCode = () => {
    if (!selected || !currentCode) {
      return
    }

    window.navigator.clipboard
      .writeText(epicGamesAccountSettingsURL(currentCode))
      .then(() => {
        toast(t('notifications.clipboard'))
      })
      .catch(() => {})
  }

  return {
    currentCode,
    isLoading,

    handleGenerateCode,
    handleOpenURL,
    handleCopyCode,
  }
}
