import type { AccountData } from '../../../types/accounts'
import type { MCPQueryProfile } from '../../../types/services/mcp'

import { Authentication } from '../authentication'

import {
  setClaimDifficultyIncreaseRewards,
  setClaimMissionAlertRewards,
  setClaimQuestReward,
  setOpenCardPackBatch,
  setRedeemSTWAccoladeTokens,
} from '../../../services/endpoints/mcp'

import {
  isMCPQueryProfileProfileChangesCardPack,
  isMCPQueryProfileProfileChangesQuest,
} from '../../../lib/check-objects'

export class MCPClaimRewards {
  static async openCardPackBatch(
    queryProfile: MCPQueryProfile,
    account: AccountData
  ) {
    try {
      const items = Object.entries(
        queryProfile.profileChanges[0]?.profile?.items ?? {}
      )

      if (items.length <= 0) {
        return null
      }

      const cardPackIds = items
        .filter(
          ([, itemValue]) =>
            isMCPQueryProfileProfileChangesCardPack(itemValue) &&
            (itemValue.attributes.match_statistics ||
              itemValue.attributes.pack_source === 'ItemCache')
        )
        .map(([itemKey]) => itemKey)

      if (cardPackIds.length <= 0) {
        return null
      }

      const accessToken = await Authentication.verifyAccessToken(account)

      if (accessToken) {
        const response = await setOpenCardPackBatch({
          accessToken,
          accountId: account.accountId,
          cardPackItemIds: cardPackIds,
        })

        return response.data
      }
    } catch (error) {
      //
    }

    return null
  }

  static async claimQuestReward(
    queryProfile: MCPQueryProfile,
    account: AccountData
  ) {
    try {
      const items = Object.entries(
        queryProfile.profileChanges[0]?.profile?.items ?? {}
      )

      if (items.length <= 0) {
        return null
      }

      const questIds = items
        .filter(
          ([, itemValue]) =>
            isMCPQueryProfileProfileChangesQuest(itemValue) &&
            itemValue.attributes.quest_state === 'Completed'
        )
        .map(([itemKey]) => itemKey)

      if (questIds.length <= 0) {
        return null
      }

      await Promise.allSettled(
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
    } catch (error) {
      //
    }

    return null
  }

  static async claimMissionAlertRewards(account: AccountData) {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (accessToken) {
        const response = await setClaimMissionAlertRewards({
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

  static async claimDifficultyIncreaseRewards(account: AccountData) {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (accessToken) {
        const response = await setClaimDifficultyIncreaseRewards({
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
