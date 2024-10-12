import type { IpcRendererEvent } from 'electron'
import type { GroupRecord } from '../../types/groups'
import type { TagRecord } from '../../types/tags'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { ipcRenderer } from 'electron'

/**
 * Tags
 */

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

/**
 * Groups
 */

export function requestGroups() {
  ipcRenderer.send(ElectronAPIEventKeys.RequestGroups)
}

export function updateGroups(groups: GroupRecord) {
  ipcRenderer.send(ElectronAPIEventKeys.UpdateGroups, groups)
}

export function responseGroups(
  callback: (value: GroupRecord) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, value: GroupRecord) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.OnLoadGroups,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.OnLoadGroups,
        customCallback
      ),
  }
}
