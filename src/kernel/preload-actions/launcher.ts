import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../types/accounts'
import type { LauncherNotificationCallbackResponseParam } from '../../types/preload'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

/**
 * Launcher
 */

export function launcherStart(account: AccountData) {
  ipcRenderer.send(ElectronAPIEventKeys.LauncherStart, account)
}

export function onNotificationLauncher(
  callback: (
    data: LauncherNotificationCallbackResponseParam
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    data: LauncherNotificationCallbackResponseParam
  ) => {
    callback(data).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.LauncherNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.LauncherNotification,
        customCallback
      ),
  }
}
