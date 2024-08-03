import type { AccountData } from '../../../types/accounts'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

import { NotificationHomebaseNameResponse } from '../../../kernel/preload-actions/mcp'

import { Authentication } from '../authentication'

import { setHomebaseName } from '../../../services/endpoints/mcp'

export class MCPHomebaseName {
  static async update(
    currentWindow: BrowserWindow,
    accounts: Array<AccountData>,
    homebaseName: string
  ) {
    try {
      const response = await Promise.allSettled(
        accounts.map(async (account) => {
          const result: NotificationHomebaseNameResponse = {
            errorMessage: undefined,
          }

          try {
            const accessToken = await Authentication.verifyAccessToken(
              account,
              currentWindow
            )

            if (!accessToken) {
              result.errorMessage = 'Unknown Error'

              return result
            }

            const { accountId } = account

            const mcpResponse = await setHomebaseName({
              accessToken,
              accountId,
              homebaseName,
            })

            if (!mcpResponse.data.profileChanges?.[0]) {
              result.errorMessage = 'Unknown Error'
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            if (error?.response?.data.errorMessage) {
              const errorMessage =
                error.response?.data?.errorMessage ?? 'Unknown Error'

              result.errorMessage = errorMessage
            } else {
              result.errorMessage = 'Unknown Error'
            }
          }

          return result
        })
      )
      const filteredResponse = response
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
      const commonError = filteredResponse.find(
        (item) => item.errorMessage
      )

      currentWindow.webContents.send(
        ElectronAPIEventKeys.HomebaseNameNotification,
        (commonError
          ? {
              errorMessage: commonError.errorMessage,
            }
          : {}) as NotificationHomebaseNameResponse
      )

      return
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.HomebaseNameNotification,
      {
        errorMessage: 'Unknown Error',
      } as NotificationHomebaseNameResponse
    )
  }
}
