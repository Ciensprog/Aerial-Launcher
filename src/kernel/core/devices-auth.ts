import type { DeviceAuthInfoWithStates } from '../../state/accounts/devices-auth'
import type { AccountData } from '../../types/accounts'

import { bots } from '../../config/constants/bots'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from '../startup/windows/main'
import { AccountsManager } from '../startup/accounts'
import { Authentication } from './authentication'

import {
  getDevicesAuth,
  removeDeviceAuth,
} from '../../services/endpoints/account'

import { toDate } from '../../lib/dates'

export class DevicesAuthManager {
  static async load(account: AccountData) {
    const devices = await DevicesAuthManager.getList(account)

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.DevicesAuthResponseData,
      devices
    )
  }

  static async getList(
    account: AccountData
  ): Promise<Array<DeviceAuthInfoWithStates>> {
    try {
      const accessToken = await Authentication.verifyAccessToken(account)

      if (!accessToken) {
        return []
      }

      const response = await getDevicesAuth({
        accessToken,
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
            itemA.accountId
          )
          const currentAccountB = AccountsManager.getAccountById(
            itemB.accountId
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
            ? (toDate(itemA.lastAccess?.dateTime)?.getTime() ?? 0)
            : -1
          const lastAccessDateB = itemB.lastAccess
            ? (toDate(itemB.lastAccess?.dateTime)?.getTime() ?? 0)
            : -1

          // Additional filters: Bots

          const deviceBotA = bots.find(
            (bot) => bot.server === itemA.created.ipAddress
          )
            ? 1
            : 0
          const deviceBotB = bots.find(
            (bot) => bot.server === itemB.created.ipAddress
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
          true
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
      false
    )
  }
}
