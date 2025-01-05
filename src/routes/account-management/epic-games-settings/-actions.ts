import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import { useGetSelectedAccount } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'
import { parseCustomDisplayName } from '../../../lib/utils'

export function useHandlers() {
  const { t } = useTranslation(['account-management'], {
    keyPrefix: 'epic-settings',
  })

  const { selected } = useGetSelectedAccount()

  useEffect(() => {
    const listener = window.electronAPI.responseEpicGamesSettings(
      async ({ account, status }) => {
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

  const handleOpenURL = () => {
    if (!selected) {
      return
    }

    window.electronAPI.openEpicGamesSettings(selected)
  }

  return {
    handleOpenURL,
  }
}
