import type { IpcRendererEvent } from 'electron'
import type {
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
