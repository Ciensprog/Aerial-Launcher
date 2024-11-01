import type { RewardsNotification } from '../../types/notifications'

import { useMemo } from 'react'

import { useGetAccounts } from '../accounts'

import { useClaimedRewardsStore } from '../../state/stw-operations/claimed-rewards'

export function useClaimedRewards() {
  const { data, updateData } = useClaimedRewardsStore()

  return {
    data,

    updateData,
  }
}

export function useParseSummary() {
  const data = useClaimedRewardsStore((state) => state.data)
  const { accountsArray } = useGetAccounts()

  const result = useMemo(() => {
    const totalNotifications = data.length
    const totalNotificationsIndex = totalNotifications - 1

    const globalSummary: {
      accolades: RewardsNotification['accolades']
      endsAt: string
      rewards: Record<string, number>
      startsAt: string
    } = {
      accolades: {
        totalMissionXPRedeemed: 0,
        totalQuestXPRedeemed: 0,
      },
      endsAt: '',
      rewards: {},
      startsAt: '',
    }
    const tmpAccountsSummary: Record<
      string,
      {
        accolades: RewardsNotification['accolades']
        accountId: string
        endsAt: string
        rewards: Record<string, number>
        startsAt: string
      }
    > = {}

    data.forEach((notification, index) => {
      // Global summary
      globalSummary.accolades.totalMissionXPRedeemed +=
        notification.accolades.totalMissionXPRedeemed
      globalSummary.accolades.totalQuestXPRedeemed +=
        notification.accolades.totalQuestXPRedeemed

      // Accounts summary
      if (!tmpAccountsSummary[notification.accountId]) {
        tmpAccountsSummary[notification.accountId] = {
          accolades: {
            totalMissionXPRedeemed: 0,
            totalQuestXPRedeemed: 0,
          },
          accountId: notification.accountId,
          endsAt: '',
          rewards: {},
          startsAt: notification.createdAt,
        }
      }

      // Global first notification
      if (index === 0) {
        globalSummary.startsAt = notification.createdAt
      } else if (totalNotificationsIndex === index) {
        globalSummary.endsAt = notification.createdAt
      }

      // Account last notification
      tmpAccountsSummary[notification.accountId].endsAt =
        notification.createdAt

      tmpAccountsSummary[
        notification.accountId
      ].accolades.totalMissionXPRedeemed +=
        notification.accolades.totalMissionXPRedeemed
      tmpAccountsSummary[
        notification.accountId
      ].accolades.totalQuestXPRedeemed +=
        notification.accolades.totalQuestXPRedeemed

      Object.entries(notification.rewards).forEach(
        ([resourceId, quantity]) => {
          // Global summary
          if (!globalSummary.rewards[resourceId]) {
            globalSummary.rewards[resourceId] = 0
          }

          globalSummary.rewards[resourceId] += quantity

          // Accounts summary
          if (
            !tmpAccountsSummary[notification.accountId].rewards[resourceId]
          ) {
            tmpAccountsSummary[notification.accountId].rewards[
              resourceId
            ] = 0
          }

          tmpAccountsSummary[notification.accountId].rewards[resourceId] +=
            quantity
        }
      )
    })

    const accountsSummary = accountsArray
      .filter((account) => tmpAccountsSummary[account.accountId])
      .map(
        (account) =>
          tmpAccountsSummary[
            account.accountId
          ] as (typeof tmpAccountsSummary)[string]
      )

    const newData = {
      globalSummary,
      accountsSummary,
    }

    return newData
  }, [accountsArray, data])

  return result
}
