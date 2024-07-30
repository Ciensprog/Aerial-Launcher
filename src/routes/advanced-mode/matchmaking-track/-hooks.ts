import { useEffect, useState } from 'react'

import { useGetSelectedAccount } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'

export function useCurrentActions() {
  const [isLoading, setIsLoading] = useState(false)

  const { selected } = useGetSelectedAccount()

  useEffect(() => {
    const listener = window.electronAPI.notificationMatchmakingSaveFile(
      async (response) => {
        setIsLoading(false)

        toast(
          response
            ? 'File has been updated successfully'
            : 'Specified player is probably not on a mission'
        )
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleSave = (accountId: string) => () => {
    if (!selected || isLoading) {
      return
    }

    setIsLoading(true)

    window.electronAPI.saveMatchmakingFile(selected, accountId)
  }

  return {
    isLoading,

    handleSave,
  }
}
