import { useEffect } from 'react'

import { usePartyFriendsForm } from '../../hooks/stw-operations/party'

export function LoadFriends() {
  const { syncFriends } = usePartyFriendsForm()

  useEffect(() => {
    const listener = window.electronAPI.notificationLoadFriends(
      async (friends) => {
        syncFriends(friends)
      }
    )

    window.electronAPI.loadFriends()

    return () => {
      listener.removeListener()
    }
  }, [])

  return null
}
