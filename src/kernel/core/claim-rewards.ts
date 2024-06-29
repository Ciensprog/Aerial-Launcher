import type { AccountDataList } from '../../types/accounts'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MCPClaimRewards } from './mcp/claim-rewards'
import { Authentication } from './authentication'

import { getQueryProfile } from '../../services/endpoints/mcp'

export class ClaimRewards {
  static async start(
    currentWindow: BrowserWindow,
    accounts: AccountDataList,
    showNotification?: boolean
  ) {
    const notificationIsActive = showNotification ?? true

    await ClaimRewards.core(accounts)

    if (notificationIsActive) {
      currentWindow.webContents.send(
        ElectronAPIEventKeys.PartyClaimActionNotification
      )
    }
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

          await Promise.allSettled([
            MCPClaimRewards.openCardPackBatch(response.data, account),
            MCPClaimRewards.claimQuestReward(response.data, account),
            MCPClaimRewards.claimMissionAlertRewards(account),
            MCPClaimRewards.claimDifficultyIncreaseRewards(account),
          ])
          await MCPClaimRewards.redeemSTWAccoladeTokens(account)
        })
      )

      return response.filter((item) => item.status === 'fulfilled')
    } catch (error) {
      //
    }

    return null
  }
}
