import { useEffect } from 'react'

import { useMatchmakingPath } from '../../../hooks/advanced-mode/matchmaking'

export function LoadMatchmakingPath() {
  const { setPath } = useMatchmakingPath()

  useEffect(() => {
    const listener = window.electronAPI.notificationMatchmakingPath(
      async (response) => {
        setPath(response)
      }
    )

    window.electronAPI.requestMatchmakingPath()

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
