import { useEffect } from 'react'

import { useGetSelectedAccount } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'

export function useHandlers() {
  const { selected } = useGetSelectedAccount()

  useEffect(() => {
    const listener = window.electronAPI.notificationClientQuestLogin(
      async () => {
        toast('Quests saved')
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleSave = () => {
    if (!selected) {
      return
    }

    window.electronAPI.setClientQuestLogin(selected)
  }

  return {
    handleSave,
  }
}
