import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

export type NotificationHomebaseNameResponse = {
  errorMessage?: string
}

export function setHomebaseName(
  accounts: Array<AccountData>,
  homebaseName: string
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.SetHombaseName,
    accounts,
    homebaseName
  )
}

export function notificationHomebaseName(
  callback: (response: NotificationHomebaseNameResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    response: NotificationHomebaseNameResponse
  ) => {
    callback(response).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.HomebaseNameNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.HomebaseNameNotification,
        customCallback
      ),
  }
}
