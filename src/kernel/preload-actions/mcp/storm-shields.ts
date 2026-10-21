import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../../types/accounts'
import type { StormShieldsAccountData } from '../../../types/storm-shields'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

export function requestStormShields(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.StormShieldsRequest, accounts)
}

export function notificationStormShields(
  callback: (value: Array<StormShieldsAccountData>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<StormShieldsAccountData>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.StormShieldsNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.StormShieldsNotification,
        customCallback
      ),
  }
}
