import type { IpcRendererEvent } from 'electron'
import type { AccountData, AccountDataList } from '../../types/accounts'
import type { FriendRecord } from '../../types/friends'
import type {
  AddNewFriendNotification,
  InviteNotification,
  PartyIncomingFriendRequest,
  PartyPlayerLookupResponse,
  PartyStatusAccountData,
  PartyStatusActionResponse,
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

export function lookupPartyPlayer(
  accounts: AccountDataList,
  displayName: string
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyLookupPlayerAction,
    accounts,
    displayName
  )
}

export function sendFriendRequests(
  accounts: AccountDataList,
  friendId: string
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartySendFriendRequestAction,
    accounts,
    friendId
  )
}

export function requestIncomingFriendRequests(accounts: AccountDataList) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyIncomingFriendRequestsRequest,
    accounts
  )
}

export function acceptIncomingFriendRequests(
  items: Array<{ account: AccountData; friendId: string }>
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyAcceptIncomingFriendRequests,
    items
  )
}

export function removeFriend(data: {
  accountId: string
  displayName: string
}) {
  ipcRenderer.send(ElectronAPIEventKeys.PartyRemoveFriendAction, data)
}

export function requestPartyStatus(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.PartyStatusRequest, accounts)
}

export function kickPartyStatusMember(
  account: AccountData,
  memberAccountId: string
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyStatusKickMember,
    account,
    memberAccountId
  )
}

export function promotePartyStatusMember(
  account: AccountData,
  memberAccountId: string
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.PartyStatusPromoteMember,
    account,
    memberAccountId
  )
}

export function leavePartyStatus(account: AccountData) {
  ipcRenderer.send(ElectronAPIEventKeys.PartyStatusLeave, account)
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

export function notificationLookupPartyPlayer(
  callback: (value: PartyPlayerLookupResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: PartyPlayerLookupResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyLookupPlayerActionNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyLookupPlayerActionNotification,
        customCallback
      ),
  }
}

export function notificationIncomingFriendRequests(
  callback: (value: Array<PartyIncomingFriendRequest>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<PartyIncomingFriendRequest>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyIncomingFriendRequestsNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyIncomingFriendRequestsNotification,
        customCallback
      ),
  }
}

export function notificationAcceptIncomingFriendRequests(
  callback: (total: number) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, total: number) => {
    callback(total).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyAcceptIncomingFriendRequestsNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyAcceptIncomingFriendRequestsNotification,
        customCallback
      ),
  }
}

export function notificationSendFriendRequests(
  callback: (value: Array<InviteNotification>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<InviteNotification>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartySendFriendRequestActionNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartySendFriendRequestActionNotification,
        customCallback
      ),
  }
}

export function notificationPartyStatus(
  callback: (value: Array<PartyStatusAccountData>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<PartyStatusAccountData>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyStatusNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyStatusNotification,
        customCallback
      ),
  }
}

export function notificationPartyStatusAction(
  callback: (value: PartyStatusActionResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: PartyStatusActionResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyStatusActionNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyStatusActionNotification,
        customCallback
      ),
  }
}

export function notificationRemoveFriend(
  callback: (value: {
    displayName: string
    status: boolean
  }) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: {
      displayName: string
      status: boolean
    }
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.PartyRemoveFriendActionNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.PartyRemoveFriendActionNotification,
        customCallback
      ),
  }
}
