import type { IpcRendererEvent } from 'electron'
import type { AccountData, AccountDataList } from '../../types/accounts'
import type { FriendRecord } from '../../types/friends'
import type {
  AddNewFriendNotification,
  InviteNotification,
} from '../../types/party'

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

export function loadFriends() {
  ipcRenderer.send(ElectronAPIEventKeys.PartyLoadFriends)
}

export function addNewFriend(account: AccountData, displayName: string) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyAddNewFriendAction,
    account,
    displayName
  )
}

export function invite(account: AccountData, accountIds: Array<string>) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyInviteAction,
    account,
    accountIds
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

export function notificationAddNewFriend(
  callback: (value: AddNewFriendNotification) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: AddNewFriendNotification
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyAddNewFriendActionNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyAddNewFriendActionNotification,
        customCallback
      ),
  }
}

export function notificationLoadFriends(
  callback: (value: FriendRecord) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, value: FriendRecord) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyLoadFriendsNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyLoadFriendsNotification,
        customCallback
      ),
  }
}

export function notificationInvite(
  callback: (value: Array<InviteNotification>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<InviteNotification>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyInviteActionNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyInviteActionNotification,
        customCallback
      ),
  }
}
