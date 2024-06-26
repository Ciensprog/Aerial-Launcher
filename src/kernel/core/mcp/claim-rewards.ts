import type { AccountData } from '../../../types/accounts'
import type { MCPQueryProfile } from '../../../types/services/mcp'

import { Authentication } from '../authentication'

import {
  setClaimDifficultyIncreaseRewards,
  setClaimMissionAlertRewards,
  setOpenCardPackBatch,
  setRedeemSTWAccoladeTokens,
} from '../../../services/endpoints/mcp'

import { isMCPQueryProfileProfileChangesCardPack } from '../../../lib/check-objects'

export class MCPClaimRewards {
  static async openCardPackBatch(
    queryProfile: MCPQueryProfile,
    account: AccountData
  ) {
    try {
      const items = Object.entries(
        queryProfile.profileChanges[0]?.profile?.items ?? {}
      )

      if (items.length > 0) {
        const cardPackIds = items
          .filter(
            ([, itemValue]) =>
              isMCPQueryProfileProfileChangesCardPack(itemValue) &&
              itemValue.attributes.match_statistics
          )
          .map(([itemKey]) => itemKey)

        const accessToken = await Authentication.verifyAccessToken(account)

        if (accessToken) {
          const response = await setOpenCardPackBatch({
            accessToken,
            accountId: account.accountId,
            cardPackItemIds: cardPackIds,
          })

          return response.data
        }
      }
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
