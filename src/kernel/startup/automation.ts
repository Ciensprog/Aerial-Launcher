import type {
  AutomationAccountData,
  AutomationAccountFileData,
  AutomationAccountServerData,
  AutomationServiceActionConfig,
  AutomationServiceStatusResponse,
} from '../../types/automation'

import { Collection } from '@discordjs/collection'
import { BrowserWindow } from 'electron'

import { AutomationStatusType } from '../../config/constants/automation'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { Service } from '../core/service'
import { AccountsManager } from './accounts'
import { DataDirectory } from './data-directory'

import { AutomationState } from '../../state/stw-operations/automation'

export class Automation {
  private static _accounts: Collection<
    string,
    AutomationAccountServerData
  > = new Collection()
  private static _services: Collection<string, Service> = new Collection()

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
    Automation.getServiceByAccountId(accountId)?.destroy()

    await Automation.refreshData(currentWindow, accountId, true)
  }

  static async updateAction(
    _currentWindow: BrowserWindow,
    accountId: string,
    config: AutomationServiceActionConfig
  ) {
    Automation.updateAccountData(accountId, {
      actions: {
        [config.type]: config.value,
      },
    })

    const current = Automation._accounts.get(accountId)

    if (!current) {
      return
    }

    const result = await DataDirectory.getAutomationFile()
    const data = {
      accountId,
      actions: {
        ...current.actions,
        [config.type]: config.value,
      },
    }

    await DataDirectory.updateAutomationFile({
      ...result.automation,
      [accountId]: data,
    })
  }

  static async start(
    currentWindow: BrowserWindow,
    data: AutomationAccountFileData,
    isReload?: boolean
  ) {
    const setDisconnected = () => {
      Automation.updateAccountData(data.accountId, {
        status: AutomationStatusType.DISCONNECTED,
      })
      currentWindow.webContents.send(
        ElectronAPIEventKeys.AutomationServiceStartNotification,
        {
          accountId: data.accountId,
          status: AutomationStatusType.DISCONNECTED,
        } as AutomationServiceStatusResponse,
        isReload
      )
    }

    try {
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

      Automation.getServiceByAccountId(data.accountId)?.destroy()

      const accounts = AccountsManager.getAccounts()
      const currentAccount = accounts.get(data.accountId)!
      const service = new Service({
        currentWindow,
        account: currentAccount,
      })

      service.onConnected(() => {
        service.checkMatchAtStartUp()
      })

      service.onDisconnected(() => {
        setDisconnected()
      })
      service.onMemberDisconnected(() => {
        setDisconnected()
      })
      service.onMemberExpired(() => {
        setDisconnected()
      })

      service.onMemberJoined(async (response) => {
        const current = Automation._accounts.get(data.accountId)

        if (!current) {
          return
        }

        if (
          current.accountId === response.account_id &&
          current.status === AutomationStatusType.DISCONNECTED
        ) {
          const newInitStatus = await service.init({
            force: true,
          })
          let newStatus: AutomationStatusType | undefined

          if (newInitStatus) {
            newStatus = AutomationStatusType.LISTENING
          } else if (newInitStatus === false) {
            newStatus = AutomationStatusType.ERROR
          }

          if (newStatus) {
            Automation.updateAccountData(current.accountId, {
              status: newStatus,
            })
            currentWindow.webContents.send(
              ElectronAPIEventKeys.AutomationServiceStartNotification,
              {
                accountId: current.accountId,
                status: newStatus,
              } as AutomationServiceStatusResponse,
              isReload
            )
          }
        }

        if (current.accountId !== response.account_id) {
          service.clearMissionInterval()
        }
      })

      service.onMemberLeft((response) => {
        if (data.accountId === response.account_id) {
          service.clearMissionInterval()
        }
      })

      // service.onMemberStateUpdated((response) => {
      //   //
      // })

      // service.onPartyUpdated((response) => {
      //   //
      // })

      // service.onDestroy(() => {
      //   //
      // })

      const initStatus = await service.init()
      Automation._services.set(currentAccount.accountId, service)

      if (initStatus) {
        defaultResponse.status = AutomationStatusType.LISTENING
      } else if (initStatus === false) {
        defaultResponse.status = AutomationStatusType.ERROR
      }

      Automation.updateAccountData(data.accountId, {
        status: defaultResponse.status,
      })
      currentWindow.webContents.send(
        ElectronAPIEventKeys.AutomationServiceStartNotification,
        defaultResponse
      )
    } catch (error) {
      setDisconnected()
    }
  }

  // static async reload(currentWindow: BrowserWindow, accountId: string) {
  //   const current = Automation._accounts.get(accountId)

  //   if (!current) {
  //     await Automation.refreshData(currentWindow, accountId)

  //     return
  //   }

  //   await Automation.start(currentWindow, current, true)
  // }

  static getServices() {
    return Automation._services.clone()
  }

  static getServiceByAccountId(accountId: string) {
    return Automation._services.find(
      (service) => service.accountId === accountId
    )
  }

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
      Automation._services.delete(accountId)
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
    const currentAutomationAccount = Automation._services.get(accountId)

    if (current) {
      const actionsNewValueClaim =
        data.actions?.claim ?? current.actions.claim
      const actionsNewValueKick =
        data.actions?.kick ?? current.actions.kick

      if (currentAutomationAccount && data.actions) {
        if (
          (!current.actions.claim && actionsNewValueClaim) ||
          (!current.actions.kick && actionsNewValueKick)
        ) {
          if (!currentAutomationAccount.startedTracking) {
            currentAutomationAccount.setStartedTracking(true)
            currentAutomationAccount.checkMatchAtStartUp()
          }
        } else if (!actionsNewValueClaim && !actionsNewValueKick) {
          currentAutomationAccount.setStartedTracking(false)
          currentAutomationAccount.clearMissionInterval()
        }
      }

      Automation._accounts.set(accountId, {
        accountId,
        actions: {
          claim: actionsNewValueClaim,
          kick: actionsNewValueKick,
        },
        status: data.status ?? current.status,
      })
    }
  }

  static getAccountById(
    accountId: string
  ): AutomationAccountServerData | undefined {
    return Automation._accounts.get(accountId)
  }
}
