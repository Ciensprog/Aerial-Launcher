import type { AccountData } from '../../../types/accounts'

import { ipcRenderer, IpcRendererEvent } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

export function setUnlock(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.UnlockRequest, accounts)
}

export function notificationUnlock(
  callback: (accountId: string, status: boolean | null) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    accountId: string,
    status: boolean | null
  ) => {
    callback(accountId, status).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.UnlockNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.UnlockNotification,
        customCallback
      ),
  }
}
