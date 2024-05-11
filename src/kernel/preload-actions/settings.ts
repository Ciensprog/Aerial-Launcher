import type { IpcRendererEvent } from 'electron'
import type { TagRecord } from '../../types/tags'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { ipcRenderer } from 'electron'

export function updateTags(tags: TagRecord) {
  ipcRenderer.send(ElectronAPIEventKeys.UpdateTags, tags)
}

export function requestTags() {
  ipcRenderer.send(ElectronAPIEventKeys.RequestTags)
}

export function responseTags(
  callback: (value: TagRecord) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, value: TagRecord) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.OnLoadTags,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.OnLoadTags,
        customCallback
      ),
  }
}

export function notificationCreationTags(callback: () => Promise<void>) {
  const customCallback = () => {
    callback().catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.NotificationCreationTag,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.NotificationCreationTag,
        customCallback
      ),
  }
}
