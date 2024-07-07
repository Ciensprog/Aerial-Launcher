import type { IpcRendererEvent } from 'electron'
import type { WorldInfoResponse } from '../../types/data/advanced-mode/world-info'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function requestWorldInfoData() {
  ipcRenderer.send(ElectronAPIEventKeys.WorldInfoRequestFile)
}

export function responseWorldInfoData(
  callback: (value: WorldInfoResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: WorldInfoResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.WorldInfoResponseFile,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.WorldInfoResponseFile,
        customCallback
      ),
  }
}
