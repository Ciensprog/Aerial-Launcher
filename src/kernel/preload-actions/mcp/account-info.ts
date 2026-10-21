import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../../types/accounts'
import type {
  AccountInfoAccountData,
  AccountInfoActionResult,
  AccountInfoProfileId,
} from '../../../types/account-info'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

export function requestAccountInfo(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.AccountInfoRequest, accounts)
}

export function requestAccountInfoRecycle(
  account: AccountData,
  itemId: string,
  profileId: AccountInfoProfileId = 'campaign'
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.AccountInfoRecycleRequest,
    account,
    itemId,
    profileId
  )
}

export function requestAccountInfoUpgrade(
  account: AccountData,
  itemId: string,
  profileId: AccountInfoProfileId = 'campaign'
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.AccountInfoUpgradeRequest,
    account,
    itemId,
    profileId
  )
}

export function notificationAccountInfo(
  callback: (value: Array<AccountInfoAccountData>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<AccountInfoAccountData>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AccountInfoNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AccountInfoNotification,
        customCallback
      ),
  }
}

export function notificationAccountInfoAction(
  callback: (value: AccountInfoActionResult) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: AccountInfoActionResult
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AccountInfoActionNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AccountInfoActionNotification,
        customCallback
      ),
  }
}
