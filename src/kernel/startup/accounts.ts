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

export class AccountsManager {
  private static _accounts: Collection<string, AccountData> =
    new Collection()
  private static _loaded = false
  private static _loadPromise: Promise<AccountDataRecord> | null = null
  private static _waiters: Array<() => void> = []

  static waitUntilLoaded(): Promise<void> {
    if (AccountsManager._loaded) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      AccountsManager._waiters.push(resolve)
    })
  }

  private static markLoaded() {
    AccountsManager._loaded = true
    const waiters = AccountsManager._waiters.splice(0)
    waiters.forEach((resolve) => resolve())
  }

  static async loadFromDisk(): Promise<AccountDataRecord> {
    if (AccountsManager._loadPromise) {
      return AccountsManager._loadPromise
    }

    AccountsManager._loadPromise = (async () => {
      const result = await DataDirectory.getAccountsFile()
      const accounts: AccountDataList = result.accounts.map((account) => {
        const data: AccountData = {
          ...account,
          accessToken: undefined,
          customDisplayName: account.customDisplayName ?? '',
          provider: undefined,
        }

        return data
      })

      const accountsRecord = accounts.reduce((accumulator, current) => {
        accumulator[current.accountId] = current

        AccountsManager._accounts.set(current.accountId, current)

        return accumulator
      }, {} as AccountDataRecord)

      AccountsManager.markLoaded()

      return accountsRecord
    })()

    try {
      return await AccountsManager._loadPromise
    } catch (error) {
      AccountsManager._loadPromise = null
      AccountsManager.markLoaded()
      throw error
    }
  }

  static async load() {
    const accountsRecord = await AccountsManager.loadFromDisk()

    MainWindow.instance.webContents.send(
      ElectronAPIEventKeys.OnAccountsLoaded,
      accountsRecord
    )
  }

  static async add(data: AccountBasicInfo) {
    const result = await DataDirectory.getAccountsFile()
    const accounts: AccountList = result.accounts.map((account) => {
      if (account.accountId === data.accountId) {
        return {
          ...account,
          ...data,
        }
      }

      return account
    })

    const current = accounts.find(
      (item) => item.accountId === data.accountId
    )

    if (!current) {
      accounts.push(data)
    }

    AccountsManager._accounts.set(data.accountId, {
      ...data,
      accessToken: undefined,
      customDisplayName: data.customDisplayName ?? '',
      provider: undefined,
    })

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

  static async reorder(accounts: AccountDataRecord) {
    const removeExtraProperties = Object.values(accounts).map(
      ({
        accountId,
        deviceId,
        displayName,
        secret,
        customDisplayName,
      }) => ({
        accountId,
        deviceId,
        displayName,
        secret,
        customDisplayName,
      })
    )

    await DataDirectory.updateAccountsFile(removeExtraProperties)
  }
}
