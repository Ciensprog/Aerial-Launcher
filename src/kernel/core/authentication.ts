import type { AccountData, AccountDataRecord } from '../../types/accounts'
import type { AuthorizationError } from '../../types/services/authorizations'

import { BrowserWindow } from 'electron'

import { electronAPIEventKeys } from '../../config/constants/main-process'

import { DataDirectory } from '../startup/data-directory'

import {
  createDeviceAuthCredentials,
  getAccessTokenUsingExchangeCode,
} from '../../services/endpoints/oauth'
import { AccountsManager } from '../startup/accounts'

export class Authentication {
  static async exchange(currentWindow: BrowserWindow, code: string) {
    try {
      const responseExchange = await getAccessTokenUsingExchangeCode(code)
      const responseDevice =
        await Authentication.generateDeviceAuthCredencials(
          currentWindow,
          electronAPIEventKeys.responseAuthWithExchange,
          {
            accessToken: responseExchange.data.access_token,
            accountId: responseExchange.data.account_id,
          }
        )

      if (responseDevice) {
        await Authentication.registerAccount(currentWindow, {
          accessToken: responseExchange.data.access_token,
          accountId: responseExchange.data.account_id,
          deviceId: responseDevice.deviceId,
          displayName: responseExchange.data.displayName,
          secret: responseDevice.secret,
        })
      }
    } catch (error) {
      Authentication.responseError({
        currentWindow,
        key: electronAPIEventKeys.responseAuthWithExchange,
        error,
      })
    }
  }

  private static async registerAccount(
    currentWindow: BrowserWindow,
    data: {
      accessToken: string
      accountId: string
      deviceId: string
      displayName: string
      secret: string
    }
  ) {
    const { accountId, deviceId, displayName, secret } = data
    const newData: AccountData = {
      accountId,
      deviceId,
      displayName,
      secret,
      provider: undefined,
      token: undefined,
    }

    await AccountsManager.add({
      accountId,
      deviceId,
      displayName,
      secret,
    })

    const { accounts } = await DataDirectory.getAccountsFile()
    const accountList = accounts.reduce((accumulator, current) => {
      accumulator[current.accountId] = current

      return accumulator
    }, {} as AccountDataRecord)

    currentWindow.webContents.send(
      electronAPIEventKeys.responseAuthWithExchange,
      {
        data: {
          currentAccount: newData,
          accounts: accountList,
        },
        accessToken: data.accessToken,
        error: null,
      }
    )
  }

  private static async generateDeviceAuthCredencials(
    currentWindow: BrowserWindow,
    key: string,
    {
      accessToken,
      accountId,
    }: {
      accessToken: string
      accountId: string
    }
  ) {
    try {
      const response = await createDeviceAuthCredentials({
        accessToken,
        accountId,
      })

      return response.data
    } catch (error) {
      Authentication.responseError({
        currentWindow,
        key,
        error,
      })
    }

    return null
  }

  private static responseError({
    currentWindow,
    error,
    key,
  }: {
    currentWindow: BrowserWindow
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
    key: string
  }) {
    currentWindow.webContents.send(key, {
      accessToken: null,
      data: null,
      error: (error.response?.data as AuthorizationError).errorMessage,
    })
  }
}
