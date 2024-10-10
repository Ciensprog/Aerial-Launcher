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
  private static _accountsMiniBosses: Collection<
    string,
    AutoPinUrnDataValue
  > = new Collection()

  static async load() {
    const { urns } = await DataDirectory.getUrnsFile()
    const { miniBosses } = await DataDirectory.getMiniBossesFile()
    const accounts = AccountsManager.getAccounts()

    Object.entries(urns).forEach(([accountId, value]) => {
      if (accounts.has(accountId)) {
        AutoPinUrns._accounts.set(accountId, value)
      }
    })

    Object.entries(miniBosses).forEach(([accountId, value]) => {
      if (accounts.has(accountId)) {
        AutoPinUrns._accountsMiniBosses.set(accountId, value)
      }
    })

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.UrnsServiceResponseData,
      {
        urns,
        miniBosses,
      }
    )
  }

  static async addAccount(accountId: string) {
    const resultUrns = await DataDirectory.getUrnsFile()
    const resultMiniBosses = await DataDirectory.getMiniBossesFile()

    await DataDirectory.updateUrnsFile({
      ...resultUrns.urns,
      [accountId]: false,
    })
    await DataDirectory.updateMiniBossesFile({
      ...resultMiniBosses.miniBosses,
      [accountId]: false,
    })

    AutoPinUrns._accounts.set(accountId, false)
    AutoPinUrns._accountsMiniBosses.set(accountId, false)
  }

  static async removeAccount(accountId: string) {
    const urns = [...AutoPinUrns._accounts.entries()]
      .filter(([currentAccountId]) => currentAccountId !== accountId)
      .reduce((accumulator, [accountId, value]) => {
        accumulator[accountId] = value

        return accumulator
      }, {} as AutoPinUrnDataList)
    const miniBosses = [...AutoPinUrns._accountsMiniBosses.entries()]
      .filter(([currentAccountId]) => currentAccountId !== accountId)
      .reduce((accumulator, [accountId, value]) => {
        accumulator[accountId] = value

        return accumulator
      }, {} as AutoPinUrnDataList)

    AutoPinUrns._accounts.delete(accountId)
    AutoPinUrns._accountsMiniBosses.delete(accountId)

    await DataDirectory.updateUrnsFile(urns)
    await DataDirectory.updateMiniBossesFile(miniBosses)
  }

  static async updateAccount(
    accountId: string,
    type: 'mini-bosses' | 'urns',
    value: AutoPinUrnDataValue
  ) {
    const isUrns = type === 'urns'
    const inUse = isUrns
      ? AutoPinUrns._accounts
      : AutoPinUrns._accountsMiniBosses
    const data = [...inUse.entries()].reduce(
      (accumulator, [currentAccountId, currentValue]) => {
        accumulator[currentAccountId] =
          currentAccountId === accountId ? value : currentValue

        return accumulator
      },
      {} as AutoPinUrnDataList
    )

    inUse.set(accountId, value)

    if (isUrns) {
      await DataDirectory.updateUrnsFile(data)
    } else {
      await DataDirectory.updateMiniBossesFile(data)
    }
  }

  static findById(accountId: string, type: 'mini-bosses' | 'urns') {
    const selector =
      type === 'mini-bosses'
        ? AutoPinUrns._accountsMiniBosses
        : AutoPinUrns._accounts

    return selector.get(accountId)
  }
}
