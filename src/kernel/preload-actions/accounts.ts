import type { IpcRendererEvent } from 'electron'
import type {
  AccountBasicInfo,
  AccountDataRecord,
  SyncAccountDataResponse,
} from '../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { EULAAccountStatus } from '../../state/accounts/eula'

/**
 * Accounts
 */

export function updateCustomDisplayName(account: AccountBasicInfo) {
  ipcRenderer.send(ElectronAPIEventKeys.UpdateAccountBasicInfo, account)
}

export function syncAccountsOrdering(accounts: AccountDataRecord) {
  ipcRenderer.send(ElectronAPIEventKeys.AccountsOrderingSync, accounts)
}

export function responseCustomDisplayName(callback: () => Promise<void>) {
  const customCallback = () => {
    callback().catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.ResponseUpdateAccountBasicInfo,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.ResponseUpdateAccountBasicInfo,
        customCallback
      ),
  }
}

export function syncAccountData(
  callback: (value: SyncAccountDataResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: SyncAccountDataResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.SyncAccessToken,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.SyncAccessToken,
        customCallback
      ),
  }
}

/**
 * EULA
 */

export function eulaVerification(accountIds: Array<string>) {
  ipcRenderer.send(
    ElectronAPIEventKeys.EULAVerificationRequest,
    accountIds
  )
}

export function eulaVerificationResponse(
  callback: (value: Record<string, EULAAccountStatus>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Record<string, EULAAccountStatus>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.EULAVerificationResponse,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.EULAVerificationResponse,
        customCallback
      ),
  }
}
