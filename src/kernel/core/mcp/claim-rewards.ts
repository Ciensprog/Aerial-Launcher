import type { AccountData } from '../../../types/accounts'
import type {
  MCPClaimDifficultyIncreaseRewardsResponse,
  MCPClaimMissionAlertRewardsResponse,
  MCPClaimQuestRewardResponse,
  MCPOpenCardPackBatchResponse,
  MCPQueryProfile,
} from '../../../types/services/mcp'

import { Authentication } from '../authentication'

import {
  setClaimDifficultyIncreaseRewards,
  setClaimMissionAlertRewards,
  setClaimQuestReward,
  setOpenCardPackBatch,
  setRedeemSTWAccoladeTokens,
} from '../../../services/endpoints/mcp'

import {
  isMCPQueryProfileChangesCardPack,
  isMCPQueryProfileChangesQuest,
} from '../../../lib/check-objects'

export class MCPClaimRewards {
  static async openCardPackBatch(
    queryProfile: MCPQueryProfile,
    account: AccountData
  ) {
    const defaultResponse: Array<MCPOpenCardPackBatchResponse> = []

    try {
      const items = Object.entries(
        queryProfile.profileChanges[0]?.profile?.items ?? {}
      )

      if (items.length <= 0) {
        return defaultResponse
      }

      const cardPackIds = items
        .filter(
          ([, itemValue]) =>
            isMCPQueryProfileChangesCardPack(itemValue) &&
            (itemValue.attributes.match_statistics ||
              itemValue.attributes.pack_source === 'ItemCache')
        )
        .map(([itemKey]) => itemKey)

      if (cardPackIds.length <= 0) {
        return defaultResponse
      }

      const accessToken = await Authentication.verifyAccessToken(account)

      if (accessToken) {
        const response = await setOpenCardPackBatch({
          accessToken,
          accountId: account.accountId,
          cardPackItemIds: cardPackIds,
        })

        return [response.data]
      }
    } catch (error) {
      //
    }

    return defaultResponse
  }

  static async claimQuestReward(
    queryProfile: MCPQueryProfile,
    account: AccountData
  ) {
    const defaultResponse: Array<MCPClaimQuestRewardResponse> = []

    try {
      const items = Object.entries(
        queryProfile.profileChanges[0]?.profile?.items ?? {}
      )

      if (items.length <= 0) {
        return defaultResponse
      }

      const questIds = items
        .filter(
          ([, itemValue]) =>
            isMCPQueryProfileChangesQuest(itemValue) &&
            itemValue.attributes.quest_state === 'Completed'
        )
        .map(([itemKey]) => itemKey)

      if (questIds.length <= 0) {
        return defaultResponse
      }

      const response = await Promise.allSettled(
        questIds.map(async (questId) => {
          const accessToken =
            await Authentication.verifyAccessToken(account)

          if (accessToken) {
            const response = await setClaimQuestReward({
              accessToken,
              questId,
              accountId: account.accountId,
            })

            return response.data
          }

          return null
        })
      )

      const sample = response
        .map((item) =>
          item.status === 'fulfilled' && item.value ? item.value : null
        )
        .filter((item) => item !== null)

      return sample as Array<MCPClaimQuestRewardResponse>
    } catch (error) {
      //
    }

    return defaultResponse
  }

  static async claimMissionAlertRewards(account: AccountData) {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (accessToken) {
        const response = await setClaimMissionAlertRewards({
          accessToken,
          accountId: account.accountId,
        })

        return [response.data]
      }
    } catch (error) {
      //
    }

    return [] as Array<MCPClaimMissionAlertRewardsResponse>
  }

  static async claimDifficultyIncreaseRewards(account: AccountData) {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (accessToken) {
        const response = await setClaimDifficultyIncreaseRewards({
          accessToken,
          accountId: account.accountId,
        })

        return [response.data]
      }
    } catch (error) {
      //
    }

    return [] as Array<MCPClaimDifficultyIncreaseRewardsResponse>
  }

  static async redeemSTWAccoladeTokens(account: AccountData) {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (accessToken) {
        const response = await setRedeemSTWAccoladeTokens({
          accessToken,
          accountId: account.accountId,
        })

        return response.data
      }
    } catch (error) {
      //
    }

    return null
  }
}
