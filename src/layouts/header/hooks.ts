import { useEffect, useState } from 'react'

import { useGetSelectedAccount } from '../../hooks/accounts'

import { toast } from '../../lib/notifications'

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
            ? `The game has been launched with the account ${data.account.displayName}`
            : `An error has occurred launching game with account ${data.account.displayName}, try again later`
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

  const handleCloseWindow = () => {
    window.electronAPI.closeWindow()
  }

  const handleMinimizeWindow = () => {
    window.electronAPI.minimizeWindow()
  }

  return { handleCloseWindow, handleLaunch, handleMinimizeWindow }
}
