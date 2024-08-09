import type {
  AutomationAccountData,
  AutomationAccountFileData,
  AutomationAccountServerData,
  AutomationServiceStatusResponse,
} from '../../types/automation'

import { Collection } from '@discordjs/collection'
import { BrowserWindow } from 'electron'

import { AutomationStatusType } from '../../config/constants/automation'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { AccountsManager } from './accounts'
import { DataDirectory } from './data-directory'

import { AutomationState } from '../../state/stw-operations/automation'

export class Automation {
  private static _accounts: Collection<
    string,
    AutomationAccountServerData
  > = new Collection()

  static async load(currentWindow: BrowserWindow) {
    const { automation } = await DataDirectory.getAutomationFile()
    const accounts = AccountsManager.getAccounts()

    Object.values(automation).forEach((data) => {
      if (accounts.has(data.accountId)) {
        Automation._accounts.set(data.accountId, {
          ...data,
          status: AutomationStatusType.LOADING,
        })
        Automation.start(currentWindow, data)
      }
    })

    currentWindow.webContents.send(
      ElectronAPIEventKeys.AutomationServiceResponseData,
      automation,
      false
    )
  }

  static async addAccount(
    currentWindow: BrowserWindow,
    accountId: string
  ) {
    const result = await DataDirectory.getAutomationFile()
    const data = {
      accountId,
      actions: {
        claim: false,
        kick: false,
      },
    }

    await DataDirectory.updateAutomationFile({
      ...result.automation,
      [accountId]: data,
    })
    Automation._accounts.set(data.accountId, {
      ...data,
      status: AutomationStatusType.LOADING,
    })
    await Automation.start(currentWindow, data)
  }

  static async removeAccount(
    currentWindow: BrowserWindow,
    accountId: string
  ) {
    Automation.updateAccountData(accountId, {
      status: AutomationStatusType.LOADING,
    })

    await new Promise((resolve) => {
      setTimeout(resolve, 1500)
    })

    await Automation.refreshData(currentWindow, accountId, true)
  }

  static async start(
    currentWindow: BrowserWindow,
    data: AutomationAccountFileData,
    isReload?: boolean
  ) {
    const defaultResponse: AutomationServiceStatusResponse = {
      accountId: data.accountId,
      status: AutomationStatusType.LOADING,
    }

    Automation.updateAccountData(data.accountId, {
      status: defaultResponse.status,
    })
    currentWindow.webContents.send(
      ElectronAPIEventKeys.AutomationServiceStartNotification,
      defaultResponse,
      isReload
    )

    const randomValue = Math.random()
    const randomStatus =
      randomValue >= 0.75
        ? AutomationStatusType.ERROR
        : randomValue >= 0.5
          ? AutomationStatusType.DISCONNECTED
          : AutomationStatusType.LISTENING

    defaultResponse.status = randomStatus

    await new Promise((resolve) => {
      setTimeout(resolve, 1500)
    })

    Automation.updateAccountData(data.accountId, {
      status: defaultResponse.status,
    })
    currentWindow.webContents.send(
      ElectronAPIEventKeys.AutomationServiceStartNotification,
      defaultResponse
    )
  }

  // static async reload(currentWindow: BrowserWindow, accountId: string) {
  //   const current = Automation._accounts.get(accountId)

  //   if (!current) {
  //     await Automation.refreshData(currentWindow, accountId)

  //     return
  //   }

  //   await Automation.start(currentWindow, current, true)
  // }

  private static async refreshData(
    currentWindow: BrowserWindow,
    accountId: string,
    removeAccount?: boolean
  ) {
    // const result = await DataDirectory.getAutomationFile()
    const automation = Automation._accounts
      .filter((account) => account.accountId !== accountId)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map((account) => account)
      .reduce(
        (accumulator, account) => {
          accumulator[account.accountId] = {
            ...account,
          }

          return accumulator
        },
        {} as Parameters<AutomationState['refreshAccounts']>[0]
      )

    if (removeAccount) {
      Automation._accounts.delete(accountId)
    }

    await DataDirectory.updateAutomationFile(automation)

    currentWindow.webContents.send(
      ElectronAPIEventKeys.AutomationServiceResponseData,
      automation,
      true
    )
  }

  private static updateAccountData(
    accountId: string,
    data: Partial<{
      actions: Partial<AutomationAccountData['actions']>
      status: Partial<AutomationAccountData['status']>
    }>
  ) {
    const current = Automation._accounts.get(accountId)

    if (current) {
      Automation._accounts.set(accountId, {
        accountId,
        actions: {
          claim: data.actions?.claim ?? current.actions.claim,
          kick: data.actions?.kick ?? current.actions.kick,
        },
        status: data.status ?? current.status,
      })
    }
  }
}
