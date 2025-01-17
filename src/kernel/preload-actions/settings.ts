import type { IpcRendererEvent } from 'electron'
import type { GroupRecord } from '../../types/groups'
import type { LanguageResponse } from '../../types/settings'
import type { TagRecord } from '../../types/tags'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { Language } from '../../locales/resources'

/**
 * Language
 */

export function requestAppLanguage() {
  ipcRenderer.send(ElectronAPIEventKeys.AppLanguageRequest)
}

export function changeAppLanguage(language: Language) {
  ipcRenderer.send(ElectronAPIEventKeys.AppLanguageUpdate, language)
}

export function appLanguageNotification(
  callback: (value: LanguageResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: LanguageResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AppLanguageNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AppLanguageNotification,
        customCallback
      ),
  }
}

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
