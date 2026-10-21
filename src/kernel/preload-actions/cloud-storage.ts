import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../types/accounts'
import type {
  CloudStorageApplyAccountResult,
  CloudStorageApplyRequest,
  CloudStorageDownloadRequest,
  CloudStorageDownloadResult,
  CloudStorageListResult,
  CloudStoragePickResult,
} from '../../types/cloud-storage'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function requestCloudStorageList(account: AccountData) {
  ipcRenderer.send(ElectronAPIEventKeys.CloudStorageListRequest, account)
}

export function notificationCloudStorageList(
  callback: (value: CloudStorageListResult) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: CloudStorageListResult,
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.CloudStorageListNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.CloudStorageListNotification,
        customCallback,
      ),
  }
}

export function requestCloudStorageDownload(
  payload: CloudStorageDownloadRequest,
) {
  ipcRenderer.send(ElectronAPIEventKeys.CloudStorageDownloadRequest, payload)
}

export function notificationCloudStorageDownload(
  callback: (value: CloudStorageDownloadResult) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: CloudStorageDownloadResult,
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.CloudStorageDownloadNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.CloudStorageDownloadNotification,
        customCallback,
      ),
  }
}

export function requestCloudStoragePick() {
  ipcRenderer.send(ElectronAPIEventKeys.CloudStoragePickRequest)
}

export function notificationCloudStoragePick(
  callback: (value: CloudStoragePickResult) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: CloudStoragePickResult,
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.CloudStoragePickNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.CloudStoragePickNotification,
        customCallback,
      ),
  }
}

export function requestCloudStorageApply(payload: CloudStorageApplyRequest) {
  ipcRenderer.send(ElectronAPIEventKeys.CloudStorageApplyRequest, payload)
}

export function notificationCloudStorageApply(
  callback: (value: Array<CloudStorageApplyAccountResult>) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<CloudStorageApplyAccountResult>,
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.CloudStorageApplyNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.CloudStorageApplyNotification,
        customCallback,
      ),
  }
}
