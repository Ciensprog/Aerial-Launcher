import type { IpcRendererEvent } from 'electron'
import type { AccountData, AccountDataList } from '../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function claimRewards(selectedAccounts: AccountDataList) {
  ipcRenderer.send(ElectronAPIEventKeys.PartyClaimAction, selectedAccounts)
}

export function kickPartyMembers(
  selectedAccount: AccountData,
  accounts: AccountDataList,
  claimState: boolean
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyKickAction,
    selectedAccount,
    accounts,
    claimState
  )
}

export function leaveParty(
  selectedAccounts: AccountDataList,
  accounts: AccountDataList,
  claimState: boolean
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyLeaveAction,
    selectedAccounts,
    accounts,
    claimState
  )
}

/**
 * Notifications
 */

export function notificationClaimRewards(callback: () => Promise<void>) {
  const customCallback = () => {
    callback().catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyClaimActionNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyClaimActionNotification,
        customCallback
      ),
  }
}

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
