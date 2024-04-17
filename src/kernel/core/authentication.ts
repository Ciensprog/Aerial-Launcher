import type { CommonErrorResponse } from '../../types/services/errors'
import type { AccountData, AccountDataRecord } from '../../types/accounts'
import type { AuthenticationByDeviceProperties } from '../../types/authentication'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { AccountsManager } from '../startup/accounts'
import { DataDirectory } from '../startup/data-directory'

import { getAntiCheatProvider } from '../../services/endpoints/caldera'
import {
  createDeviceAuthCredentials,
  getAccessTokenUsingAuthorizationCode,
  getAccessTokenUsingDeviceAuth,
  getAccessTokenUsingExchangeCode,
  getExchangeCodeAccessToken,
} from '../../services/endpoints/oauth'

export class Authentication {
  static async authorization(currentWindow: BrowserWindow, code: string) {
    try {
      const responseAuthorization =
        await getAccessTokenUsingAuthorizationCode(code)
      const responseDevice =
        await Authentication.generateDeviceAuthCredencials(
          currentWindow,
          ElectronAPIEventKeys.ResponseAuthWithAuthorization,
          {
            accessToken: responseAuthorization.data.access_token,
            accountId: responseAuthorization.data.account_id,
          }
        )

      if (responseDevice) {
        await Authentication.registerAccount(
          currentWindow,
          ElectronAPIEventKeys.ResponseAuthWithAuthorization,
          {
            accessToken: responseAuthorization.data.access_token,
            accountId: responseAuthorization.data.account_id,
            deviceId: responseDevice.deviceId,
            displayName: responseAuthorization.data.displayName,
            secret: responseDevice.secret,
          }
        )
      }
    } catch (error) {
      Authentication.responseError({
        currentWindow,
        key: ElectronAPIEventKeys.ResponseAuthWithAuthorization,
        error,
      })
    }
  }

  static async device(
    currentWindow: BrowserWindow,
    data: AuthenticationByDeviceProperties
  ) {
    try {
      const responseDevice = await getAccessTokenUsingDeviceAuth(data)

      await Authentication.registerAccount(
        currentWindow,
        ElectronAPIEventKeys.ResponseAuthWithDevice,
        {
          accessToken: responseDevice.data.access_token,
          accountId: responseDevice.data.account_id,
          deviceId: data.deviceId,
          displayName: responseDevice.data.displayName,
          secret: data.secret,
        }
      )
    } catch (error) {
      Authentication.responseError({
        currentWindow,
        key: ElectronAPIEventKeys.ResponseAuthWithDevice,
        error,
      })
    }
  }

  static async exchange(currentWindow: BrowserWindow, code: string) {
    try {
      const responseExchange = await getAccessTokenUsingExchangeCode(code)
      const responseDevice =
        await Authentication.generateDeviceAuthCredencials(
          currentWindow,
          ElectronAPIEventKeys.ResponseAuthWithExchange,
          {
            accessToken: responseExchange.data.access_token,
            accountId: responseExchange.data.account_id,
          }
        )

      if (responseDevice) {
        await Authentication.registerAccount(
          currentWindow,
          ElectronAPIEventKeys.ResponseAuthWithExchange,
          {
            accessToken: responseExchange.data.access_token,
            accountId: responseExchange.data.account_id,
            deviceId: responseDevice.deviceId,
            displayName: responseExchange.data.displayName,
            secret: responseDevice.secret,
          }
        )
      }
    } catch (error) {
      Authentication.responseError({
        currentWindow,
        key: ElectronAPIEventKeys.ResponseAuthWithExchange,
        error,
      })
    }
  }

  static async requestProviderAndAccessToken(
    currentWindow: BrowserWindow,
    account: AccountData
  ) {
    try {
      const responseDevice = await getAccessTokenUsingDeviceAuth(account)
      const responseExchange = await getExchangeCodeAccessToken(
        responseDevice.data.access_token
      )
      const responseACProvider = await getAntiCheatProvider({
        accountId: account.accountId,
        exchangeCode: responseExchange.data.code,
      })

      currentWindow.webContents.send(
        ElectronAPIEventKeys.ResponseProviderAndAccessTokenOnStartup,
        {
          account,
          data: {
            accessToken: responseDevice.data.access_token,
            provider: responseACProvider.data.provider ?? null,
          },
          error: null,
        }
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      currentWindow.webContents.send(
        ElectronAPIEventKeys.ResponseProviderAndAccessTokenOnStartup,
        {
          account,
          data: null,
          error: (error.response?.data as CommonErrorResponse)
            .errorMessage,
        }
      )
    }
  }

  private static async registerAccount(
    currentWindow: BrowserWindow,
    eventKey: ElectronAPIEventKeys,
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

    currentWindow.webContents.send(eventKey, {
      data: {
        currentAccount: newData,
        accounts: accountList,
      },
      accessToken: data.accessToken,
      error: null,
    })
  }

  private static async generateDeviceAuthCredencials(
    currentWindow: BrowserWindow,
    key: ElectronAPIEventKeys,
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
    key: ElectronAPIEventKeys
  }) {
    currentWindow.webContents.send(key, {
      accessToken: null,
      data: null,
      error: (error.response?.data as CommonErrorResponse).errorMessage,
    })
  }
}
