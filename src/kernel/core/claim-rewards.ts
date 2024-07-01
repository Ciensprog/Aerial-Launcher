import type {
  MCPClaimDifficultyIncreaseRewardsResponse,
  MCPClaimMissionAlertRewardsResponse,
  MCPClaimQuestRewardResponse,
  MCPOpenCardPackBatchResponse,
} from '../../types/services/mcp'
import type { AccountDataList } from '../../types/accounts'
import type { RewardsNotification } from '../../types/notifications'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MCPClaimRewards } from './mcp/claim-rewards'
import { Authentication } from './authentication'

import { getQueryProfile } from '../../services/endpoints/mcp'

export class ClaimRewards {
  static async start(
    currentWindow: BrowserWindow,
    accounts: AccountDataList
  ) {
    ClaimRewards.core(accounts).then((response) => {
      if (response) {
        currentWindow.webContents.send(
          ElectronAPIEventKeys.ClaimRewardsClientNotification,
          response
        )
      }

      currentWindow.webContents.send(
        ElectronAPIEventKeys.PartyClaimActionNotification
      )
    })
  }

  static async core(accounts: AccountDataList) {
    if (accounts.length <= 0) {
      return null
    }

    try {
      const response = await Promise.allSettled(
        accounts.map(async (account) => {
          const accessToken =
            await Authentication.verifyAccessToken(account)

          if (!accessToken) {
            return null
          }

          const response = await getQueryProfile({
            accessToken,
            accountId: account.accountId,
          })
          const profileChanges = response.data.profileChanges[0] ?? null

          const rewardsToClaim: Array<
            Promise<
              Array<
                | MCPClaimDifficultyIncreaseRewardsResponse
                | MCPClaimMissionAlertRewardsResponse
                | MCPClaimQuestRewardResponse
                | MCPOpenCardPackBatchResponse
              >
            >
          > = [
            MCPClaimRewards.openCardPackBatch(response.data, account),
            MCPClaimRewards.claimQuestReward(response.data, account),
          ]

          const pendingMissionAlertRewardsTotal =
            profileChanges?.profile.stats.attributes
              .mission_alert_redemption_record.pendingMissionAlertRewards
              ?.items.length ?? 0
          const pendingDifficultyIncreaseRewardsTotal =
            profileChanges?.profile.stats.attributes
              .difficulty_increase_rewards_record?.pendingRewards.length ??
            0

          if (pendingMissionAlertRewardsTotal > 0) {
            rewardsToClaim.push(
              MCPClaimRewards.claimMissionAlertRewards(account)
            )
          }

          if (pendingDifficultyIncreaseRewardsTotal > 0) {
            rewardsToClaim.push(
              MCPClaimRewards.claimDifficultyIncreaseRewards(account)
            )
          }

          const claimsResponse = await Promise.allSettled(rewardsToClaim)
          const accoladesResponse =
            await MCPClaimRewards.redeemSTWAccoladeTokens(account)

          const notifications: Array<{
            itemType: string
            quantity: number
          }> = []

          claimsResponse.forEach((claimResponse) => {
            if (claimResponse.status === 'fulfilled') {
              claimResponse.value.forEach((item) => {
                item.notifications?.forEach((notification) => {
                  if (notification.loot) {
                    if (notification.loot.items) {
                      notification.loot.items.forEach((loot) => {
                        notifications.push({
                          itemType: loot.itemType,
                          quantity: loot.quantity,
                        })
                      })
                    } else if (notification.loot.lootGranted) {
                      notification.loot.lootGranted.items.forEach(
                        (loot) => {
                          notifications.push({
                            itemType: loot.itemType,
                            quantity: loot.quantity,
                          })
                        }
                      )
                    }
                  } else if (notification.lootGranted) {
                    notification.lootGranted?.items.forEach((loot) => {
                      notifications.push({
                        itemType: loot.itemType,
                        quantity: loot.quantity,
                      })
                    })
                  }
                })
              })
            }
          })

          const accolades = accoladesResponse?.notifications.reduce(
            (accumulator, current) => {
              accumulator.totalMissionXPRedeemed +=
                current.totalMissionXPRedeemed
              accumulator.totalQuestXPRedeemed +=
                current.totalQuestXPRedeemed

              return accumulator
            },
            {
              totalMissionXPRedeemed: 0,
              totalQuestXPRedeemed: 0,
            }
          ) ?? {
            totalMissionXPRedeemed: 0,
            totalQuestXPRedeemed: 0,
          }

          const rewards: RewardsNotification['rewards'] = {}

          notifications.forEach(({ itemType, quantity }) => {
            if (!itemType.toLowerCase().startsWith('accolades:')) {
              const newItemType =
                itemType === 'AccountResource:campaign_event_currency'
                  ? profileChanges.profile.stats.attributes.event_currency
                      .templateId
                  : itemType

              if (!rewards[newItemType]) {
                rewards[newItemType] = 0
              }

              rewards[newItemType] += quantity
            }
          })

          return {
            accolades,
            rewards,
            accountId: account.accountId,
          }
        })
      )

      const records = response.map((item) =>
        item.status === 'fulfilled' ? item.value : null
      )
      const newNotifications = records.filter(
        (item) => item !== null && Object.keys(item.rewards).length > 0
      ) as Array<RewardsNotification>

      return newNotifications.length > 0 ? newNotifications : null
    } catch (error) {
      //
    }

    return null
  }
}
