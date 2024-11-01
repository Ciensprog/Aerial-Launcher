import type {
  MCPClaimDifficultyIncreaseRewardsResponse,
  MCPClaimMissionAlertRewardsResponse,
  MCPClaimQuestRewardResponse,
  MCPOpenCardPackBatchResponse,
} from '../../types/services/mcp'
import type { AccountDataList } from '../../types/accounts'
import type { RewardsNotification } from '../../types/notifications'

import { QuestEventRepeatable } from '../../config/constants/fortnite/quests'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { AccountsManager } from '../startup/accounts'
import { AutoPinUrns } from '../startup/auto-pin-urns'
import { Automation } from '../startup/automation'
import { SettingsManager } from '../startup/settings'
import { MCPClaimRewards } from './mcp/claim-rewards'
import { MCPStorageTransfer } from './mcp/storage-transfer'
import { Authentication } from './authentication'

import {
  getQueryProfile,
  setSetPinnedQuests,
} from '../../services/endpoints/mcp'

import { getRawDate } from '../../lib/dates'

export class ClaimRewards {
  static async start(
    accounts: AccountDataList,
    useGlobalNotification?: boolean
  ) {
    ClaimRewards.core(accounts).then((response) => {
      if (response) {
        MainWindow.instance.webContents.send(
          useGlobalNotification
            ? ElectronAPIEventKeys.ClaimRewardsClientGlobalSyncNotification
            : ElectronAPIEventKeys.ClaimRewardsClientNotification,
          response
        )
      }

      MainWindow.instance.webContents.send(
        useGlobalNotification
          ? ElectronAPIEventKeys.ClaimRewardsClientGlobalAutoClaimedNotification
          : ElectronAPIEventKeys.PartyClaimActionNotification
      )
    })
  }

  static async core(accounts: AccountDataList) {
    if (accounts.length <= 0) {
      return null
    }

    try {
      const settings = await SettingsManager.getData()
      const claimingRewardsDelay = Number(settings.claimingRewards)

      if (claimingRewardsDelay > 0) {
        await new Promise((resolve) => {
          setTimeout(() => resolve(true), claimingRewardsDelay * 1_000)
        })
      }

      const response = await Promise.allSettled(
        accounts.map(async (account) => {
          const automationAccount = Automation.getAccountById(
            account.accountId
          )
          const accountToTransfer = AccountsManager.getAccountById(
            account.accountId
          )

          if (
            automationAccount &&
            accountToTransfer &&
            automationAccount.actions.transferMats === true
          ) {
            MCPStorageTransfer.buildingMaterials(accountToTransfer).catch(
              () => {}
            )
          }

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
              .mission_alert_redemption_record?.pendingMissionAlertRewards
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
                const hasAutoPinMiniBosses = AutoPinUrns.findById(
                  account.accountId,
                  'mini-bosses'
                )
                const hasAutoPinUrns = AutoPinUrns.findById(
                  account.accountId,
                  'urns'
                )

                if (
                  hasAutoPinMiniBosses === true ||
                  hasAutoPinUrns === true
                ) {
                  const pinMiniBosses = item.notifications?.find(
                    (notification) =>
                      notification.questId ===
                      QuestEventRepeatable.ExorcismByElimination
                  )
                  const pinUrns = item.notifications?.find(
                    (notification) =>
                      notification.questId ===
                      QuestEventRepeatable.UrnYourKeep
                  )

                  if (pinMiniBosses || pinUrns) {
                    Authentication.verifyAccessToken(account)
                      .then((accessToken) => {
                        if (accessToken) {
                          getQueryProfile({
                            accessToken,
                            accountId: account.accountId,
                          })
                            .then((newQueryProfile) => {
                              const newProfileChanges =
                                newQueryProfile.data.profileChanges[0] ??
                                null

                              const currentPinned =
                                newProfileChanges.profile.stats.attributes
                                  .client_settings?.pinnedQuestInstances ??
                                []
                              const newItems = Object.entries(
                                newProfileChanges.profile.items ?? []
                              )
                                .filter(([, itemValue]) => {
                                  return (
                                    (hasAutoPinMiniBosses === true &&
                                      itemValue.templateId ===
                                        QuestEventRepeatable.ExorcismByElimination) ||
                                    (hasAutoPinUrns === true &&
                                      itemValue.templateId ===
                                        QuestEventRepeatable.UrnYourKeep)
                                  )
                                })
                                .map(([itemId]) => itemId)

                              const data = {
                                accessToken,
                                accountId: account.accountId,
                                pinnedQuestIds: [
                                  ...currentPinned,
                                  ...newItems,
                                ],
                              }

                              setSetPinnedQuests(data).catch(() => {})
                            })
                            .catch(() => {})
                        }
                      })
                      .catch(() => {})
                  }
                }

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
                current.totalMissionXPRedeemed ?? 0
              accumulator.totalQuestXPRedeemed +=
                current.totalQuestXPRedeemed ?? 0

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

          const result: RewardsNotification = {
            accolades,
            rewards,
            createdAt: getRawDate(),
            id: crypto.randomUUID(),
            accountId: account.accountId,
          }

          return result
        })
      )

      const records = response.map((item) =>
        item.status === 'fulfilled' ? item.value : null
      )
      const newNotifications = records.filter(
        (item) => item !== null && Object.keys(item.rewards).length > 0
      ) as Array<RewardsNotification>

      return newNotifications.length > 0 ? newNotifications : null

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    return null
  }
}
