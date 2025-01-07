import type { CommonErrorResponse } from '../../types/services/errors'
import type {
  AccountData,
  AccountDataRecord,
  SyncAccountDataResponse,
} from '../../types/accounts'
import type { AuthenticationByDeviceProperties } from '../../types/authentication'
import type {
  EpicGamesSettingsNotificationCallbackResponseParam,
  GenerateExchangeCodeNotificationCallbackResponseParam,
} from '../../types/preload'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
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

import { LauncherAuthError } from '../../lib/validations/schemas/fortnite/auth'
import { accountDataSchema } from '../../lib/validations/schemas/accounts'

export class Authentication {
  static async authorization(code: string) {
    try {
      const responseAuthorization =
        await getAccessTokenUsingAuthorizationCode(code)
      const responseDevice =
        await Authentication.generateDeviceAuthCredencials(
          ElectronAPIEventKeys.ResponseAuthWithAuthorization,
          {
            accessToken: responseAuthorization.data.access_token,
            accountId: responseAuthorization.data.account_id,
          }
        )

      const accountData = {
        accessToken: responseAuthorization.data.access_token,
        accountId: responseAuthorization.data.account_id,
        deviceId: responseDevice?.deviceId,
        displayName: responseAuthorization.data.displayName,
        secret: responseDevice?.secret,
      } as {
        accessToken: string
        accountId: string
        deviceId: string
        displayName: string
        secret: string
      }

      accountDataSchema.parse(accountData)

      if (responseDevice) {
        await Authentication.registerAccount(
          ElectronAPIEventKeys.ResponseAuthWithAuthorization,
          accountData
        )
      }
    } catch (error) {
      return Authentication.responseError({
        key: ElectronAPIEventKeys.ResponseAuthWithAuthorization,
        error,
      })
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.ResponseAuthWithAuthorization,
      {
        accessToken: null,
        data: null,
        error: LauncherAuthError.login,
      }
    )
  }

  static async device(data: AuthenticationByDeviceProperties) {
    try {
      const responseDevice = await getAccessTokenUsingDeviceAuth(data)

      const accountData = {
        accessToken: responseDevice.data.access_token,
        accountId: responseDevice.data.account_id,
        deviceId: data.deviceId,
        displayName: responseDevice.data.displayName,
        secret: data.secret,
      } as {
        accessToken: string
        accountId: string
        deviceId: string
        displayName: string
        secret: string
      }

      accountDataSchema.parse(accountData)

      await Authentication.registerAccount(
        ElectronAPIEventKeys.ResponseAuthWithDevice,
        accountData
      )
    } catch (error) {
      Authentication.responseError({
        key: ElectronAPIEventKeys.ResponseAuthWithDevice,
        error,
      })
    }
  }

  static async exchange(code: string) {
    try {
      const responseExchange = await getAccessTokenUsingExchangeCode(code)
      const responseDevice =
        await Authentication.generateDeviceAuthCredencials(
          ElectronAPIEventKeys.ResponseAuthWithExchange,
          {
            accessToken: responseExchange.data.access_token,
            accountId: responseExchange.data.account_id,
          }
        )

      const accountData = {
        accessToken: responseExchange.data.access_token,
        accountId: responseExchange.data.account_id,
        deviceId: responseDevice?.deviceId,
        displayName: responseExchange.data.displayName,
        secret: responseDevice?.secret,
      } as {
        accessToken: string
        accountId: string
        deviceId: string
        displayName: string
        secret: string
      }

      accountDataSchema.parse(accountData)

      if (responseDevice) {
        await Authentication.registerAccount(
          ElectronAPIEventKeys.ResponseAuthWithExchange,
          accountData
        )
      }
    } catch (error) {
      return Authentication.responseError({
        key: ElectronAPIEventKeys.ResponseAuthWithExchange,
        error,
      })
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.ResponseAuthWithAuthorization,
      {
        accessToken: null,
        data: null,
        error: LauncherAuthError.login,
      }
    )
  }

  static async generateExchangeCode(account: AccountData) {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        MainWindow.instance.webContents.send(
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
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.ResponseGenerateExchangeCode,
          {
            account,
            status: true,
            code: exchange.data.code,
          } as GenerateExchangeCodeNotificationCallbackResponseParam
        )

        return
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.ResponseGenerateExchangeCode,
      {
        account,
        status: false,
        code: null,
      } as GenerateExchangeCodeNotificationCallbackResponseParam
    )
  }

  static async openEpicGamesSettings(account: AccountData) {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        MainWindow.instance.webContents.send(
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
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.OpenEpicGamesSettingsNotification,
          {
            account,
            code: exchange.data.code,
            status: true,
          } as EpicGamesSettingsNotificationCallbackResponseParam
        )

        return
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.OpenEpicGamesSettingsNotification,
      {
        account,
        status: false,
      }
    )
  }

  static async verifyAccessToken(account: AccountData) {
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

      MainWindow.instance.webContents.send(
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

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          //
        }
      }
    }

    return null
  }

  private static async registerAccount(
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

    MainWindow.instance.webContents.send(eventKey, {
      data: {
        currentAccount: newData,
        accounts: accountList,
      },
      accessToken: data.accessToken,
      error: null,
    })
  }

  private static async generateDeviceAuthCredencials(
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
        key,
        error,
      })
    }

    return null
  }

  private static responseError({
    error,
    key,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
    key: ElectronAPIEventKeys
  }) {
    MainWindow.instance.webContents.send(key, {
      accessToken: null,
      data: null,
      error:
        (error.response?.data as CommonErrorResponse)?.errorMessage ??
        LauncherAuthError.login,
    })
  }
}
