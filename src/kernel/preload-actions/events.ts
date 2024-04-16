import type { IpcRendererEvent } from 'electron'
import type { AccountDataRecord } from '../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

/**
 * Events
 */

export function onAccountsLoaded(
  callback: (values: AccountDataRecord) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    values: AccountDataRecord
  ) => {
    callback(values).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.OnAccountsLoaded,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.OnAccountsLoaded,
        customCallback
      ),
  }
}

export function onRemoveAccount(accountId: string) {
  if (typeof accountId !== 'string') {
    return
  }

  ipcRenderer.send(ElectronAPIEventKeys.OnRemoveAccount, accountId)
}
