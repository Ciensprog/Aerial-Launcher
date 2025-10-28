import { useEffect } from 'react'

import { usePartyFriendsForm } from '../../hooks/stw-operations/party'
import { useFriendsManagementActions } from '../../hooks/management/friends'

import { toast } from '../../lib/notifications'

export function LoadFriends() {
  const { syncFriends } = usePartyFriendsForm()
  const {
    removeFriends,
    syncBlocklist,
    syncIncoming,
    syncOutgoing,
    syncSummary,
    updateLoading,
  } = useFriendsManagementActions()

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

  useEffect(() => {
    const summaryListener = window.electronAPI.notificationFriendsSummary(
      async (accountId, summary) => {
        updateLoading(false)
        syncSummary(accountId, summary)
      }
    )
    const blockFriendsListener =
      window.electronAPI.notificationBlockFriends(
        async (account, blocklist, context) => {
          if (context === undefined) {
            removeFriends(
              account.accountId,
              blocklist.map((item) => item.accountId)
            )
          } else if (context === 'incoming') {
            syncIncoming('remove', account.accountId, blocklist)
          } else if (context === 'outgoing') {
            syncOutgoing('remove', account.accountId, blocklist)
          }

          syncBlocklist('add', account.accountId, blocklist)

          toast(`Total bloqueados: ${blocklist.length}`)
        }
      )
    const unblockFriendsListener =
      window.electronAPI.notificationUnblockFriends(
        async (account, unblocklist) => {
          syncBlocklist(
            'remove',
            account.accountId,
            unblocklist === 'full' ? undefined : unblocklist
          )

          toast(
            unblocklist === 'full'
              ? 'Se desbloquearon a todos'
              : `Total desbloqueados: ${unblocklist.length}`
          )
        }
      )
    const addFriendsListener = window.electronAPI.notificationAddFriends(
      async (account, friends, context) => {
        if (context === undefined) {
          //
        } else if (context === 'incoming') {
          syncIncoming('remove', account.accountId, friends)
        }

        toast(`Total añadidos: ${friends.length}`)
      }
    )
    const removeFriendsListener =
      window.electronAPI.notificationRemoveFriends(
        async (account, friends, context) => {
          const isFull = friends === 'full'

          if (context === undefined) {
            removeFriends(
              account.accountId,
              isFull ? undefined : friends.map((item) => item.accountId)
            )
          } else if (context === 'incoming') {
            syncIncoming(
              'remove',
              account.accountId,
              isFull ? undefined : friends
            )
          } else if (context === 'outgoing') {
            syncOutgoing(
              'remove',
              account.accountId,
              isFull ? undefined : friends
            )
          }

          toast(
            isFull
              ? 'Se eliminaron todos los amigos'
              : `Total eliminados: ${friends.length}`
          )
        }
      )

    return () => {
      summaryListener.removeListener()
      blockFriendsListener.removeListener()
      unblockFriendsListener.removeListener()
      addFriendsListener.removeListener()
      removeFriendsListener.removeListener()
    }
  }, [])

  return null
}
