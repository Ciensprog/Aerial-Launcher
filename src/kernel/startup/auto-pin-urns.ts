import type {
  AutoPinUrnDataList,
  AutoPinUrnDataValue,
} from '../../types/urns'

import { Collection } from '@discordjs/collection'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from './windows/main'
import { AccountsManager } from './accounts'
import { DataDirectory } from './data-directory'

export class AutoPinUrns {
  private static _accounts: Collection<string, AutoPinUrnDataValue> =
    new Collection()

  static async load() {
    const { urns } = await DataDirectory.getUrnsFile()
    const accounts = AccountsManager.getAccounts()

    Object.entries(urns).forEach(([accountId, value]) => {
      if (accounts.has(accountId)) {
        AutoPinUrns._accounts.set(accountId, value)
      }
    })

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.UrnsServiceResponseData,
      urns
    )
  }

  static async addAccount(accountId: string) {
    const result = await DataDirectory.getUrnsFile()

    await DataDirectory.updateUrnsFile({
      ...result.urns,
      [accountId]: false,
    })
    AutoPinUrns._accounts.set(accountId, false)
  }

  static async removeAccount(accountId: string) {
    const urns = [...AutoPinUrns._accounts.entries()]
      .filter(([currentAccountId]) => currentAccountId !== accountId)
      .reduce((accumulator, [accountId, value]) => {
        accumulator[accountId] = value

        return accumulator
      }, {} as AutoPinUrnDataList)

    AutoPinUrns._accounts.delete(accountId)
    await DataDirectory.updateUrnsFile(urns)
  }

  static async updateAccount(
    accountId: string,
    value: AutoPinUrnDataValue
  ) {
    const urns = [...AutoPinUrns._accounts.entries()].reduce(
      (accumulator, [currentAccountId, currentValue]) => {
        accumulator[currentAccountId] =
          currentAccountId === accountId ? value : currentValue

        return accumulator
      },
      {} as AutoPinUrnDataList
    )

    await DataDirectory.updateUrnsFile(urns)
  }

  static findById(accountId: string) {
    return AutoPinUrns._accounts.get(accountId)
  }
}
