import type { IpcRendererEvent } from 'electron'
import type { AccountData, AccountList } from '../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function kickPartyMembers(
  selectedAccount: AccountData,
  accounts: AccountList
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyKickAction,
    selectedAccount,
    accounts
  )
}

export function leaveParty(
  selectedAccounts: AccountList,
  accounts: AccountList
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyLeaveAction,
    selectedAccounts,
    accounts
  )
}

/**
 * Notifications
 */

export function notificationKick(
  callback: (total: number) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, total: number) => {
    callback(total).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyKickActionNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyKickActionNotification,
        customCallback
      ),
  }
}

export function notificationLeave(
  callback: (total: number) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, total: number) => {
    callback(total).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyLeaveActionNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyLeaveActionNotification,
        customCallback
      ),
  }
}
