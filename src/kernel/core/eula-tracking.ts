// import type { AccountData } from '../../types/accounts'

import { AccountsManager } from '../startup/accounts'

// import childProcess from 'node:child_process'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'
import { launcherAppClient2 } from '../../config/fortnite/clients'

import { MainWindow } from '../startup/windows/main'
// import { DataDirectory } from '../startup/data-directory'
import { Authentication } from './authentication'

import { EULAAccountStatus } from '../../state/accounts/eula'

import {
  getAccessTokenUsingExchangeCode,
  getExchangeCodeUsingAccessToken,
} from '../../services/endpoints/oauth'

export class EULATracking {
  static async verify(accountIds: Array<string>) {
    accountIds.forEach((accountId) => {
      const account = AccountsManager.getAccountById(accountId)

      if (account) {
        Authentication.verifyAccessToken(account)
          .then(async (accessToken) => {
            const sendDefaultError = () => {
              MainWindow.instance.webContents.send(
                ElectronAPIEventKeys.EULAVerificationResponse,
                {
                  [accountId]: {
                    correctiveAction: 'Unknown',
                    isLoading: false,
                    status: false,
                    url: null,
                  },
                } as Record<string, EULAAccountStatus>
              )
            }

            if (!accessToken) {
              sendDefaultError()

              return
            }

            const accountExchangeCode =
              await getExchangeCodeUsingAccessToken(accessToken)

            if (!accountExchangeCode.data.code) {
              sendDefaultError()

              return
            }

            const launcherAccessToken =
              await getAccessTokenUsingExchangeCode(
                accountExchangeCode.data.code,
                {
                  headers: {
                    Authorization: `basic ${launcherAppClient2.auth}`,
                  },
                }
              )

            if (!launcherAccessToken.data.access_token) {
              sendDefaultError()

              return
            }

            MainWindow.instance.webContents.send(
              ElectronAPIEventKeys.EULAVerificationResponse,
              {
                [accountId]: {
                  correctiveAction: null,
                  isLoading: false,
                  status: true,
                  url: null,
                },
              } as Record<string, EULAAccountStatus>
            )
          })
          .catch((error) => {
            const errorCode = error.response?.data?.errorCode
            const data = {
              continuationUrl:
                error.response?.data?.continuationUrl ?? null,
              correctiveAction:
                error.response?.data?.correctiveAction ?? null,
            }
            const response: Record<string, EULAAccountStatus> = {
              [accountId]: {
                correctiveAction:
                  typeof data.correctiveAction === 'string'
                    ? data.correctiveAction
                    : 'Unknown',
                isLoading: false,
                status: false,
                url: null,
              },
            }

            if (
              errorCode ===
              'errors.com.epicgames.oauth.corrective_action_required'
            ) {
              if (typeof data.continuationUrl === 'string') {
                const params = new URLSearchParams(
                  `?redirectUrl=${data.continuationUrl}`
                )
                const url = `https://www.epicgames.com/id/logout?${params.toString()}`

                response[accountId].url = url
              }
            }

            MainWindow.instance.webContents.send(
              ElectronAPIEventKeys.EULAVerificationResponse,
              response
            )
          })
      }
    })
  }
}
