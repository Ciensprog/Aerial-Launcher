import type { AccountBasicInfo } from '../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

/**
 * Accounts
 */

export function updateCustomDisplayName(account: AccountBasicInfo) {
  ipcRenderer.send(ElectronAPIEventKeys.UpdateAccountBasicInfo, account)
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
