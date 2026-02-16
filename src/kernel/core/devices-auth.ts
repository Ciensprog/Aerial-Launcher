import type { DeviceAuthInfoWithStates } from '../../state/accounts/devices-auth'
import type { AccountData } from '../../types/accounts'

import { bots } from '../../config/constants/bots'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'
import { fortnitePCGameClient } from '../../config/fortnite/clients'

import { MainWindow } from '../startup/windows/main'
import { AccountsManager } from '../startup/accounts'
import { Authentication } from './authentication'

import {
  getDevicesAuth,
  removeDeviceAuth,
} from '../../services/endpoints/account'
import {
  createAccessTokenUsingExchange,
  getAccessTokenUsingDeviceAuth,
  getExchangeCode,
} from '../../services/endpoints/oauth'

import { toDate } from '../../lib/dates'

export class DevicesAuthManager {
  static async load(account: AccountData) {
    const devices = await DevicesAuthManager.getList(account)

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.DevicesAuthResponseData,
      devices,
    )
  }

  static async getList(
    account: AccountData,
  ): Promise<Array<DeviceAuthInfoWithStates>> {
    try {
      const deviceAccessToken = await getAccessTokenUsingDeviceAuth({
        accountId: account.accountId,
        deviceId: account.deviceId,
        secret: account.secret,
        token_type: 'eg1',
      })

      if (!deviceAccessToken.data.access_token) {
        return []
      }

      const exchangeCode = await getExchangeCode({
        headers: {
          Authorization: `bearer ${deviceAccessToken.data.access_token}`,
        },
        params: {
          consumingClientId: fortnitePCGameClient.clientId,
        },
      })

      if (!exchangeCode.data.code) {
        return []
      }

      const exchangeToken = await createAccessTokenUsingExchange(
        {
          exchange_code: exchangeCode.data.code,
          token_type: 'eg1',
        },
        {
          headers: {
            Authorization: `basic ${fortnitePCGameClient.auth}`,
            'X-Epic-Device-ID': '5df240e94544c30f50b9c0839f8903ae',
          },
        },
      )

      if (!exchangeToken.data.access_token) {
        return []
      }

      const response = await getDevicesAuth({
        accessToken: exchangeToken.data.access_token,
        accountId: account.accountId,
      })
      const data = response.data ?? []

      const parsedData = data
        .map((current) => ({
          ...current,
          isDeleting: false,
        }))
        .toSorted((itemA, itemB) => {
          const currentAccountA = AccountsManager.getAccountById(
            itemA.accountId,
          )
          const currentAccountB = AccountsManager.getAccountById(
            itemB.accountId,
          )

          const deviceA =
            currentAccountA?.deviceId === itemA.deviceId ? 1 : 0
          const deviceB =
            currentAccountB?.deviceId === itemB.deviceId ? 1 : 0

          const createdDateA =
            toDate(itemA.created.dateTime).getTime() ?? 0
          const createdDateB =
            toDate(itemB.created.dateTime).getTime() ?? 0

          const lastAccessDateA = itemA.lastAccess
            ? toDate(itemA.lastAccess?.dateTime)?.getTime() ?? 0
            : -1
          const lastAccessDateB = itemB.lastAccess
            ? toDate(itemB.lastAccess?.dateTime)?.getTime() ?? 0
            : -1

          // Additional filters: Bots

          const deviceBotA = bots.find(
            (bot) => bot.server === itemA.created.ipAddress,
          )
            ? 1
            : 0
          const deviceBotB = bots.find(
            (bot) => bot.server === itemB.created.ipAddress,
          )
            ? 1
            : 0

          return (
            deviceB - deviceA ||
            deviceBotB - deviceBotA ||
            lastAccessDateB - lastAccessDateA ||
            createdDateB - createdDateA
          )
        })

      return parsedData

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    return []
  }

  static async remove(account: AccountData, deviceId: string) {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (accessToken) {
        await removeDeviceAuth({
          accessToken,
          deviceId,
          accountId: account.accountId,
        })

        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.DevicesAuthRemoveNotification,
          account,
          deviceId,
          true,
        )

        return
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //
    }

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.DevicesAuthRemoveNotification,
      account,
      deviceId,
      false,
    )
  }
}
