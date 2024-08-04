import type { CommonErrorResponse } from '../../types/services/errors'
import type {
  AccountData,
  AccountDataRecord,
  SyncAccountDataResponse,
} from '../../types/accounts'
import type { AuthenticationByDeviceProperties } from '../../types/authentication'
import type { GenerateExchangeCodeNotificationCallbackResponseParam } from '../../types/preload'

import { BrowserWindow, shell } from 'electron'

import { epicGamesAccountSettingsURL } from '../../config/fortnite/links'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { AccountsManager } from '../startup/accounts'
import { DataDirectory } from '../startup/data-directory'

import {
  createDeviceAuthCredentials,
  getAccessTokenUsingAuthorizationCode,
  getAccessTokenUsingDeviceAuth,
  getAccessTokenUsingExchangeCode,
  getExchangeCodeUsingAccessToken,
  oauthVerify,
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

  static async generateExchangeCode(
    currentWindow: BrowserWindow,
    account: AccountData
  ) {
    try {
      const accessToken = await Authentication.verifyAccessToken(
        account,
        currentWindow
      )

      if (!accessToken) {
        currentWindow.webContents.send(
          ElectronAPIEventKeys.ResponseGenerateExchangeCode,
          {
            account,
            status: false,
            code: null,
          } as GenerateExchangeCodeNotificationCallbackResponseParam
        )

        return
      }

      const exchange = await getExchangeCodeUsingAccessToken(accessToken)

      if (exchange.data.code) {
        currentWindow.webContents.send(
          ElectronAPIEventKeys.ResponseGenerateExchangeCode,
          {
            account,
            status: true,
            code: exchange.data.code,
          } as GenerateExchangeCodeNotificationCallbackResponseParam
        )

        return
      }
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.ResponseGenerateExchangeCode,
      {
        account,
        status: false,
        code: null,
      } as GenerateExchangeCodeNotificationCallbackResponseParam
    )
  }

  static async openEpicGamesSettings(
    currentWindow: BrowserWindow,
    account: AccountData
  ) {
    try {
      const accessToken = await Authentication.verifyAccessToken(
        account,
        currentWindow
      )

      if (!accessToken) {
        currentWindow.webContents.send(
          ElectronAPIEventKeys.OpenEpicGamesSettingsNotification,
          {
            account,
            status: false,
          }
        )

        return
      }

      const exchange = await getExchangeCodeUsingAccessToken(accessToken)

      if (exchange.data.code) {
        await shell.openExternal(
          epicGamesAccountSettingsURL(exchange.data.code)
        )

        currentWindow.webContents.send(
          ElectronAPIEventKeys.OpenEpicGamesSettingsNotification,
          {
            account,
            status: true,
          }
        )

        return
      }
    } catch (error) {
      //
    }

    currentWindow.webContents.send(
      ElectronAPIEventKeys.OpenEpicGamesSettingsNotification,
      {
        account,
        status: false,
      }
    )
  }

  static async verifyAccessToken(
    account: AccountData,
    currentWindow: BrowserWindow
  ) {
    const currentAccount =
      AccountsManager.getAccountById(account.accountId) ?? account

    const syncAccessToken = (data: {
      accessToken: string | null
      displayName: string
    }) => {
      const newData = {
        ...data,
        displayName: data.displayName ?? currentAccount.displayName,
      }

      AccountsManager.syncAccount(currentAccount.accountId, data)

      currentWindow.webContents.send(
        ElectronAPIEventKeys.SyncAccessToken,
        {
          data: newData,
          accountId: currentAccount.accountId,
        } as SyncAccountDataResponse
      )
    }
    const generateAccessToken = async () => {
      const response = await getAccessTokenUsingDeviceAuth(currentAccount)
      const accessToken = response.data.access_token ?? null

      syncAccessToken({
        accessToken,
        displayName: response.data.displayName,
      })

      return accessToken
    }

    try {
      if (!currentAccount.accessToken) {
        const response = await generateAccessToken()

        return response
      }

      const response = await oauthVerify(currentAccount.accessToken)
      const accessToken = response.data.token ?? null

      syncAccessToken({
        accessToken,
        displayName: response.data.display_name,
      })

      return accessToken
    } catch (error) {
      if (
        (error as Record<string, { status: number }>).response?.status ===
        401
      ) {
        try {
          const response = await generateAccessToken()

          return response
        } catch (error) {
          //
        }
      }
    }

    return null
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
      accessToken: undefined,
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
