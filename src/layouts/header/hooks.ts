import { useEffect, useState } from 'react'

import { fortniteDBProfileURL } from '../../config/fortnite/links'

import { useGetSelectedAccount } from '../../hooks/accounts'

import { toast } from '../../lib/notifications'
import { parseCustomDisplayName } from '../../lib/utils'

export function useAttributesStates() {
  const [open, setOpen] = useState(false)
  const { selected } = useGetSelectedAccount()

  const isButtonDisabled =
    selected === null || selected.token === undefined

  return {
    isButtonDisabled,
    open,

    setOpen,
  }
}

export function useHandlers() {
  const { selected } = useGetSelectedAccount()

  useEffect(() => {
    const notificationLauncherListener =
      window.electronAPI.onNotificationLauncher(async (data) => {
        toast(
          data.status
            ? `The game has been launched with the account ${data.account.displayName}${parseCustomDisplayName(data.account)}`
            : `An error has occurred launching game with account ${data.account.displayName}${parseCustomDisplayName(data.account)}, try again later`
        )
      })

    return () => {
      notificationLauncherListener.removeListener()
    }
  }, [])

  const handleLaunch = () => {
    if (selected) {
      window.electronAPI.launcherStart(selected)
    }
  }

  const handleOpenFNDBProfile = () => {
    if (selected) {
      window.electronAPI.openExternalURL(
        fortniteDBProfileURL(selected.displayName)
      )
    }
  }

  const handleCloseWindow = () => {
    window.electronAPI.closeWindow()
  }

  const handleMinimizeWindow = () => {
    window.electronAPI.minimizeWindow()
  }

  return {
    handleCloseWindow,
    handleLaunch,
    handleMinimizeWindow,
    handleOpenFNDBProfile,
  }
}
