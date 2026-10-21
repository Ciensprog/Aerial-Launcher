import type { AccountData } from '../../types/accounts'
import type {
  AlertsDoneCheckAccountData,
  AlertsDoneSearchPlayerConfig,
  AlertsDoneSearchPlayerResponse,
} from '../../types/alerts'

import justRandom from 'just-random'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { Authentication } from './authentication'
import { LookupManager } from './lookup'

import {
  getQueryProfile,
  getQueryPublicProfile,
} from '../../services/endpoints/mcp'

export class AlertsDone {
  static async fetchPlayerData({
    accounts,
    inputSearch,
  }: AlertsDoneSearchPlayerConfig) {
    const defaultResponse: AlertsDoneSearchPlayerResponse = {
      data: null,
      errorMessage: 'Sorry, the request cannot be made',
      isPrivate: false,
      success: false,
    }
    const currentAccount =
      accounts.find(
        (account) =>
          account.accountId === inputSearch ||
          account.displayName.toLowerCase() === inputSearch.toLowerCase()
      ) ?? justRandom(accounts)

    const sendDefaultResponse = () => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.HomeFetchPlayerResponse,
        defaultResponse
      )
    }

    if (currentAccount) {
      try {
        const response = await LookupManager.searchUserByDisplayName({
          account: currentAccount,
          displayName: inputSearch,
        })

        if (!response.success) {
          defaultResponse.errorMessage = `${response.errorMessage}`

          sendDefaultResponse()

          return
        }

        defaultResponse.data = {
          lookup: response.data,
        }

        const accessToken =
          await Authentication.verifyAccessToken(currentAccount)

        if (!accessToken) {
          sendDefaultResponse()

          return
        }

        const queryProfileResponse = await getQueryPublicProfile({
          accessToken,
          accountId: response.data.id,
        })
        const profileChanges =
          queryProfileResponse.data.profileChanges[0] ?? null

        if (profileChanges) {
          MainWindow.instance.webContents.send(
            ElectronAPIEventKeys.HomeFetchPlayerResponse,
            {
              data: {
                profileChanges,
                lookup: response.data,
              },
              errorMessage: null,
              isPrivate: false,
              success: true,
            } as AlertsDoneSearchPlayerResponse
          )

          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const response =
          (error?.response?.data as Record<string, number | string>) ?? {}

        if (
          response.errorCode ===
          'errors.com.epicgames.fortnite.operation_forbidden'
        ) {
          defaultResponse.isPrivate = true
        } else {
          defaultResponse.data = null
          defaultResponse.errorMessage = null
          defaultResponse.isPrivate = false
          defaultResponse.success = false
        }
      }
    }

    sendDefaultResponse()
  }

  static async checkAccounts(accounts: Array<AccountData>) {
    try {
      const responses = await Promise.allSettled(
        accounts.map((account) => AlertsDone.checkAccount(account)),
      )
      const data = responses.flatMap((response) =>
        response.status === 'fulfilled' ? [response.value] : [],
      )

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.AlertsDoneCheckNotification,
        data,
      )

      return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.AlertsDoneCheckNotification,
      [],
    )
  }

  private static async checkAccount(
    account: AccountData,
  ): Promise<AlertsDoneCheckAccountData> {
    const result: AlertsDoneCheckAccountData = {
      accountId: account.accountId,
      available: true,
      claimedAlertIds: [],
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

      result.claimedAlertIds = (
        profile.stats?.attributes?.mission_alert_redemption_record
          ?.claimData ?? []
      )
        .map((item) => item.missionAlertId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)

      return result
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      result.available = false
      result.errorMessage =
        (error?.response?.data?.errorMessage as string | undefined) ??
        'Unknown Error'

      return result
    }
  }
}
