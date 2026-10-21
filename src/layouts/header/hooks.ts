import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'

import { stwNewsProfileURL } from '../../config/fortnite/links'

import { useGetSelectedAccount } from '../../hooks/accounts'
import { useCustomProcessStatus } from '../../hooks/settings'

import { toast } from '../../lib/notifications'
import { parseCustomDisplayName } from '../../lib/utils'

export function useAttributesStates() {
  const [open, setOpen] = useState(false)
  const { selected } = useGetSelectedAccount()
  const { customProcessIsRunning } = useCustomProcessStatus()

  const isButtonDisabled = selected === null // || selected.accessToken === undefined

  return {
    customProcessIsRunning,
    isButtonDisabled,
    open,

    setOpen,
  }
}

export function useHandlers() {
  const { t } = useTranslation(['general'])
  const [isGeneratingCmd, setIsGeneratingCmd] = useState(false)

  const { selected } = useGetSelectedAccount()

  useEffect(() => {
    const notificationLauncherListener =
      window.electronAPI.onNotificationLauncher(async (data) => {
        toast(
          t(
            `launch-game.notifications.${data.status ? 'success' : 'error'}`,
            {
              name: parseCustomDisplayName(data.account),
            }
          )
        )
      })

    return () => {
      notificationLauncherListener.removeListener()
    }
  }, [])

  const handleLaunch = () => {
    if (!selected) {
      return
    }

    window.electronAPI.launcherStart(selected)
  }

  const handleGenerateLaunchCmd = async () => {
    if (!selected || isGeneratingCmd) {
      return
    }

    setIsGeneratingCmd(true)

    try {
      const result = await window.electronAPI.launcherGenerateCmd(selected)

      if (!result.success || !result.command) {
        toast(t('launch-game.cmd.error'))
        return
      }

      await window.navigator.clipboard.writeText(result.command)
      toast(t('launch-game.cmd.copied'))
    } catch {
      toast(t('launch-game.cmd.error'))
    } finally {
      setIsGeneratingCmd(false)
    }
  }

  const handleKillProcess = () => {
    window.electronAPI.killProcess()
  }

  const handleOpenSTWNewsProfile = () => {
    if (!selected) {
      return
    }

    window.electronAPI.openExternalURL(
      stwNewsProfileURL(selected.accountId)
    )
  }

  const handleCloseWindow = () => {
    window.electronAPI.closeWindow()
  }

  const handleMinimizeWindow = () => {
    window.electronAPI.minimizeWindow()
  }

  return {
    handleCloseWindow,
    handleGenerateLaunchCmd,
    handleKillProcess,
    handleLaunch,
    handleMinimizeWindow,
    handleOpenSTWNewsProfile,
    isGeneratingCmd,
  }
}

export function useWindowEvents() {
  const matchMediaRef = useRef(window.matchMedia('(min-width: 930px)'))
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
