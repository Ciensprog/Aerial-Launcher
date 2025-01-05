import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'

import { fortniteDBProfileURL } from '../../config/fortnite/links'

import { useGetSelectedAccount } from '../../hooks/accounts'

import { toast } from '../../lib/notifications'
import { parseCustomDisplayName } from '../../lib/utils'

export function useAttributesStates() {
  const [open, setOpen] = useState(false)
  const { selected } = useGetSelectedAccount()

  const isButtonDisabled = selected === null // || selected.accessToken === undefined

  return {
    isButtonDisabled,
    open,

    setOpen,
  }
}

export function useHandlers() {
  const { t } = useTranslation(['general'])

  const { selected } = useGetSelectedAccount()

  useEffect(() => {
    const notificationLauncherListener =
      window.electronAPI.onNotificationLauncher(async (data) => {
        toast(
          data.status
            ? t('launch-game.notifications.success', {
                name: parseCustomDisplayName(data.account),
              })
            : t('launch-game.notifications.error', {
                name: parseCustomDisplayName(data.account),
              })
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
        fortniteDBProfileURL(selected.accountId)
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

export function useWindowEvents() {
  const matchMediaRef = useRef(window.matchMedia('(min-width: 800px)'))
  const [isMinWith, setIsMinWith] = useState(
    !matchMediaRef.current.matches
  )

  useEffect(() => {
    const handler = (event: MediaQueryListEvent) => {
      setIsMinWith(!event.matches)
    }

    matchMediaRef.current.addEventListener('change', handler)

    return () => {
      matchMediaRef.current.removeEventListener('change', handler)
    }
  }, [])

  return {
    isMinWith,
  }
}
