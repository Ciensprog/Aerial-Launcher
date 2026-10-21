import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../types/accounts'
import type { AccountExportResult } from '../../types/account-export'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function requestAccountExport(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.AccountExportRequest, accounts)
}

export function notificationAccountExport(
  callback: (value: AccountExportResult) => Promise<void>,
) {
  const customCallback = (_: IpcRendererEvent, value: AccountExportResult) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AccountExportNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AccountExportNotification,
        customCallback,
      ),
  }
}
