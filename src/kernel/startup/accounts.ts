import type {
  AccountInformation,
  AccountListDetailed,
} from '../../types/accounts'

import { BrowserWindow } from 'electron'

import { electronAPIEventKeys } from '../../config/constants/main-process'

export class AccountsManager {
  static async load(currentWindow: BrowserWindow) {
    const accounts: Array<AccountInformation> = Array.from(
      Array(2),
      (_, index) => {
        const key = `a1b2c3d4e5f6g7h8i9j0k-${index}`

        return {
          accountId: key,
          deviceId: `device-${key}`,
          displayName: `Sample-${index}`,
          secret: `secret-${key}`,
        }
      }
    )
    const accountList = accounts.reduce((accumulator, current) => {
      accumulator[current.accountId] = {
        ...current,
        provider: undefined,
      }

      return accumulator
    }, {} as AccountListDetailed)

    currentWindow.webContents.send(
      electronAPIEventKeys.onAccountsLoaded,
      accountList
    )
  }
}
