import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../types/accounts'
import type {
  EpicAddFriend,
  EpicFriend,
  FriendBlock,
  FriendIncoming,
  FriendOutgoing,
  FriendsSummary,
} from '../../types/services/friends'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function requestFriendsSummary(account: AccountData) {
  ipcRenderer.send(ElectronAPIEventKeys.GetFriendsSummary, account)
}

export function requestBlockFriends(
  account: AccountData,
  friends: Array<EpicFriend | FriendIncoming | FriendOutgoing>,
  context?: 'incoming' | 'outgoing'
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.BlockFriends,
    account,
    friends,
    context
  )
}

export function requestUnblockFriends(
  account: AccountData,
  unblocklist: 'full' | Array<FriendBlock>
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.UnblockFriends,
    account,
    unblocklist
  )
}

export function requestRemoveFriends(
  account: AccountData,
  friends: 'full' | Array<EpicFriend | FriendOutgoing>,
  context?: 'incoming' | 'outgoing'
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.RemoveFriends,
    account,
    friends,
    context
  )
}

export function requestAddFriends(
  account: AccountData,
  friends: Array<EpicAddFriend>,
  context?: 'incoming'
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.AddFriends,
    account,
    friends,
    context
  )
}

export function notificationFriendsSummary(
  callback: (
    accountId: string,
    value: FriendsSummary | null
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    accountId: string,
    value: FriendsSummary | null
  ) => {
    callback(accountId, value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.GetFriendsSummaryResponse,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.GetFriendsSummaryResponse,
        customCallback
      ),
  }
}

export function notificationBlockFriends(
  callback: (
    account: AccountData,
    blocklist: Array<FriendBlock>,
    context?: 'incoming' | 'outgoing'
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    account: AccountData,
    blocklist: Array<FriendBlock>,
    context?: 'incoming' | 'outgoing'
  ) => {
    callback(account, blocklist, context).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.BlockFriendsResponse,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.BlockFriendsResponse,
        customCallback
      ),
  }
}

export function notificationUnblockFriends(
  callback: (
    account: AccountData,
    unblocklist: 'full' | Array<FriendBlock>
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    account: AccountData,
    unblocklist: 'full' | Array<FriendBlock>
  ) => {
    callback(account, unblocklist).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.UnblockFriendsResponse,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.UnblockFriendsResponse,
        customCallback
      ),
  }
}

export function notificationAddFriends(
  callback: (
    account: AccountData,
    friends: Array<EpicFriend>,
    context?: 'incoming'
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    account: AccountData,
    friends: Array<EpicFriend>,
    context?: 'incoming'
  ) => {
    callback(account, friends, context).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AddFriendsResponse,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AddFriendsResponse,
        customCallback
      ),
  }
}

export function notificationRemoveFriends(
  callback: (
    account: AccountData,
    friends: 'full' | Array<EpicFriend>,
    context?: 'incoming' | 'outgoing'
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    account: AccountData,
    friends: 'full' | Array<EpicFriend>,
    context?: 'incoming' | 'outgoing'
  ) => {
    callback(account, friends, context).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.RemoveFriendsResponse,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.RemoveFriendsResponse,
        customCallback
      ),
  }
}
