import { useEffect } from 'react'

import { useGetSelectedAccount } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'
import { parseCustomDisplayName } from '../../../lib/utils'

export function useHandlers() {
  const { selected } = useGetSelectedAccount()

  useEffect(() => {
    const listener = window.electronAPI.responseEpicGamesSettings(
      async ({ account, status }) => {
        toast(
          status
            ? `A new tab in your browser should be opened with Epic Games settings URL for ${parseCustomDisplayName(account)} account`
            : 'An error occurred while processing your request',
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
