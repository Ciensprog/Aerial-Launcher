import type {
  AccountBasicInfo,
  AccountData,
  AccountDataList,
  AccountDataRecord,
  AccountList,
} from '../../types/accounts'

import { Collection } from '@discordjs/collection'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { MainWindow } from './windows/main'
import { Automation } from './automation'
import { DataDirectory } from './data-directory'

import {
  localeCompareForSorting,
  parseCustomDisplayName,
} from '../../lib/utils'

export class AccountsManager {
  private static _accounts: Collection<string, AccountData> =
    new Collection()

  static async load() {
    const result = await DataDirectory.getAccountsFile()
    const accounts: AccountDataList = result.accounts
      .map((account) => {
        const data: AccountData = {
          ...account,
          accessToken: undefined,
          customDisplayName: account.customDisplayName ?? '',
          provider: undefined,
        }

        return data
      })
      .toSorted((itemA, itemB) =>
        localeCompareForSorting(
          parseCustomDisplayName(itemA),
          parseCustomDisplayName(itemB)
        )
      )

    const accountList = accounts.reduce((accumulator, current) => {
      accumulator[current.accountId] = current

      AccountsManager._accounts.set(current.accountId, current)

      return accumulator
    }, {} as AccountDataRecord)

    MainWindow.instance.webContents.send(
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

    AccountsManager._accounts.set(data.accountId, {
      ...data,
      accessToken: undefined,
      customDisplayName: data.customDisplayName ?? '',
      provider: undefined,
    })

    accounts = accounts.toSorted((itemA, itemB) =>
      localeCompareForSorting(
        parseCustomDisplayName(itemA),
        parseCustomDisplayName(itemB)
      )
    )

    await DataDirectory.updateAccountsFile(accounts)
  }

  static async remove(accountId: string) {
    const result = await DataDirectory.getAccountsFile()
    const accounts = result.accounts.filter(
      (account) => account.accountId !== accountId
    )

    AccountsManager._accounts.delete(accountId)
    Automation.removeAccount(accountId)

    await DataDirectory.updateAccountsFile(accounts)
  }

  static getAccounts(): Collection<string, AccountData> {
    return AccountsManager._accounts.clone()
  }

  static getAccountById(accountId: string): AccountData | undefined {
    return AccountsManager._accounts.get(accountId)
  }

  static syncAccount(accountId: string, data: Partial<AccountData>) {
    const current = AccountsManager._accounts.get(accountId)

    if (!current) {
      return
    }

    AccountsManager._accounts.set(accountId, {
      ...current,
      ...data,
    })
  }
}
