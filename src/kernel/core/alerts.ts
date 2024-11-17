import type {
  AlertsDoneSearchPlayerConfig,
  AlertsDoneSearchPlayerResponse,
} from '../../types/alerts'

import justRandom from 'just-random'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { Authentication } from './authentication'
import { LookupManager } from './lookup'

import { getQueryPublicProfile } from '../../services/endpoints/mcp'

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
}
