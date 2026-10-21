import type { AccountData } from '../../../types/accounts'
import type { StormShieldsAccountData } from '../../../types/storm-shields'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

import { MainWindow } from '../../startup/windows/main'
import { Authentication } from '../authentication'

import { getQueryProfile } from '../../../services/endpoints/mcp'
import {
  SSD_MAX,
  emptyStormShields,
  parseStormShields,
  stormShieldTotal,
} from '../../../lib/stw/storm-shields'

export class MCPStormShields {
  static async request(accounts: Array<AccountData>) {
    try {
      const responses = await Promise.allSettled(
        accounts.map(async (account) => {
          return MCPStormShields.requestAccount(account)
        })
      )

      const data = responses
        .filter((response) => response.status === 'fulfilled')
        .map((response) => response.value)

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.StormShieldsNotification,
        data
      )

      return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.StormShieldsNotification,
      []
    )
  }

  private static async requestAccount(
    account: AccountData
  ): Promise<StormShieldsAccountData> {
    const zones = emptyStormShields()
    const result: StormShieldsAccountData = {
      accountId: account.accountId,
      available: true,
      zones,
      total: 0,
      complete: false,
    }

    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        result.available = false
        result.errorMessage = 'Unknown Error'

        return result
      }

      const profileResponse = await getQueryProfile({
        accessToken,
        accountId: account.accountId,
      })
      const profile =
        profileResponse.data.profileChanges?.[0]?.profile ?? null

      if (!profile) {
        result.available = false
        result.errorMessage = 'Unknown Error'

        return result
      }

      result.zones = parseStormShields(
        (profile.items ?? {}) as Record<
          string,
          {
            templateId?: string
            attributes?: Record<string, unknown>
          }
        >
      )
      result.total = stormShieldTotal(result.zones)
      result.complete = result.total === SSD_MAX * 4

      return result
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      result.available = false
      result.errorMessage =
        error?.response?.data?.errorMessage ?? 'Unknown Error'
    }

    return result
  }
}
