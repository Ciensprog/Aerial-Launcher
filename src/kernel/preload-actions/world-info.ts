import type { IpcRendererEvent } from 'electron'
import type {
  SaveWorldInfoData,
  WorldInfoDeleteResponse,
  WorldInfoExportResponse,
  WorldInfoFileData,
  WorldInfoResponse,
} from '../../types/data/advanced-mode/world-info'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function requestWorldInfoData() {
  ipcRenderer.send(ElectronAPIEventKeys.WorldInfoRequestData)
}

export function requestWorldInfoFiles() {
  ipcRenderer.send(ElectronAPIEventKeys.WorldInfoRequestFiles)
}

export function saveWorldInfoData(data: SaveWorldInfoData) {
  ipcRenderer.send(ElectronAPIEventKeys.WorldInfoSaveFile, data)
}

export function deleteWorldInfoFile(data: WorldInfoFileData) {
  ipcRenderer.send(ElectronAPIEventKeys.WorldInfoDeleteFile, data)
}

export function exportWorldInfoFile(data: WorldInfoFileData) {
  ipcRenderer.send(ElectronAPIEventKeys.WorldInfoExportFile, data)
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
    ElectronAPIEventKeys.WorldInfoResponseData,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.WorldInfoResponseData,
        customCallback
      ),
  }
}

export function responseWorldInfoFiles(
  callback: (value: Array<WorldInfoFileData>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<WorldInfoFileData>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.WorldInfoResponseFiles,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.WorldInfoResponseFiles,
        customCallback
      ),
  }
}

export function saveWorldInfoDataNotification(
  callback: (value: boolean) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, value: boolean) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.WorldInfoSaveNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.WorldInfoSaveNotification,
        customCallback
      ),
  }
}

export function deleteWorldInfoFileNotification(
  callback: (value: WorldInfoDeleteResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: WorldInfoDeleteResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.WorldInfoDeleteNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.WorldInfoDeleteNotification,
        customCallback
      ),
  }
}

export function exportWorldInfoFileNotification(
  callback: (value: WorldInfoExportResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: WorldInfoExportResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.WorldInfoExportFileNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.WorldInfoExportFileNotification,
        customCallback
      ),
  }
}
