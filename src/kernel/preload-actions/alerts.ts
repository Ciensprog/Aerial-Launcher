import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../types/accounts'
import type {
  AlertsDoneCheckAccountData,
  AlertsDoneSearchPlayerConfig,
  AlertsDoneSearchPlayerResponse,
} from '../../types/alerts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function fetchPlayerData(config: AlertsDoneSearchPlayerConfig) {
  ipcRenderer.send(ElectronAPIEventKeys.HomeFetchPlayerRequest, config)
}

export function fetchPlayerDataNotification(
  callback: (value: AlertsDoneSearchPlayerResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: AlertsDoneSearchPlayerResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.HomeFetchPlayerResponse,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.HomeFetchPlayerResponse,
        customCallback
      ),
  }
}

export function requestAlertsDoneCheck(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.AlertsDoneCheckRequest, accounts)
}

export function notificationAlertsDoneCheck(
  callback: (value: Array<AlertsDoneCheckAccountData>) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<AlertsDoneCheckAccountData>,
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AlertsDoneCheckNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AlertsDoneCheckNotification,
        customCallback,
      ),
  }
}
