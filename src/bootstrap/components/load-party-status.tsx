import type {
  PartyStatusAccountData,
  PartyStatusAction,
} from '../../types/party'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { toast } from '../../lib/notifications'
import { usePartyStatusStore } from '../../state/stw-operations/party-status'

export function LoadPartyStatus() {
  const { t } = useTranslation(['stw-operations'])

  useEffect(() => {
    const statusListener = window.electronAPI.notificationPartyStatus(
      async (value) => {
        const store = usePartyStatusStore.getState()

        store.setLoading(false)
        store.setBusyAccountId(null)
        store.setResults(value)
      }
    )

    const actionListener = window.electronAPI.notificationPartyStatusAction(
      async (value) => {
        const store = usePartyStatusStore.getState()

        store.setBusyAccountId(null)

        if (value.data) {
          applyPartyActionToResults(value.data, value.action)
        }

        if (value.success) {
          if (value.action === 'kick') {
            toast(
              t('party.status.kick-success', {
                name: value.memberName ?? '',
              })
            )
          } else if (value.action === 'promote') {
            toast(
              t('party.status.promote-success', {
                name: value.memberName ?? '',
              })
            )
          } else if (value.action === 'leave') {
            toast(t('party.status.leave-success'))
          }

          return
        }

        if (value.errorMessage === 'Need party leader') {
          toast(t('party.status.need-leader'))

          return
        }

        toast(value.errorMessage || t('party.status.action-error'))
      }
    )

    return () => {
      statusListener.removeListener()
      actionListener.removeListener()
    }
  }, [t])

  return null
}

function applyPartyActionToResults(
  acting: PartyStatusAccountData,
  action?: PartyStatusAction,
) {
  const store = usePartyStatusStore.getState()
  const shareParty =
    (action === 'kick' || action === 'promote') && acting.partyId

  store.setResults(
    store.results.map((row) => {
      if (row.accountId === acting.accountId) {
        return acting
      }

      if (!shareParty || row.partyId !== acting.partyId) {
        return row
      }

      const stillIn = acting.members.some(
        (member) => member.accountId === row.accountId,
      )

      if (!stillIn) {
        return {
          ...row,
          inParty: false,
          isLeader: false,
          partyId: null,
          memberCount: 0,
          maxSize: 0,
          members: [],
        }
      }

      return {
        ...row,
        isLeader: acting.members.some(
          (member) =>
            member.accountId === row.accountId && member.role === 'CAPTAIN',
        ),
        memberCount: acting.memberCount,
        maxSize: acting.maxSize,
        members: acting.members.map((member) => ({
          ...member,
          isYou: member.accountId === row.accountId,
        })),
      }
    }),
  )
}
