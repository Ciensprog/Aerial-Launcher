import type {
  AccountBasicInfo,
  AccountDataList,
  AccountDataRecord,
  AccountList,
} from '../../types/accounts'

import { BrowserWindow } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { DataDirectory } from './data-directory'

export class AccountsManager {
  static async load(currentWindow: BrowserWindow) {
    const result = await DataDirectory.getAccountsFile()
    const accounts: AccountDataList = result.accounts
      .map((account) => ({
        ...account,
        customDisplayName: account.customDisplayName ?? '',
        provider: undefined,
        token: undefined,
      }))
      .toSorted((itemA, itemB) =>
        itemA.displayName.localeCompare(itemB.displayName)
      )

    const accountList = accounts.reduce((accumulator, current) => {
      accumulator[current.accountId] = current

      return accumulator
    }, {} as AccountDataRecord)

    currentWindow.webContents.send(
      ElectronAPIEventKeys.OnAccountsLoaded,
      accountList
    )
  }

  static async add(data: AccountBasicInfo) {
    const result = await DataDirectory.getAccountsFile()
    const current = result.accounts.find(
      ({ accountId }) => accountId === data.accountId
    )
    let accounts: AccountList = []

    if (current) {
      accounts = [
        ...result.accounts.filter(
          ({ accountId }) => accountId !== data.accountId
        ),
        data,
      ]
    } else {
      accounts = [...result.accounts, data]
    }

    accounts = accounts.toSorted((itemA, itemB) =>
      itemA.displayName.localeCompare(itemB.displayName)
    )

    await DataDirectory.updateAccountsFile(accounts)
  }

  static async remove(accountId: string) {
    const result = await DataDirectory.getAccountsFile()
    const accounts = result.accounts.filter(
      (account) => account.accountId !== accountId
    )

    await DataDirectory.updateAccountsFile(accounts)
  }
}
