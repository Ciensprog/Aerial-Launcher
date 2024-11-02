import type { IpcRendererEvent } from 'electron'
import type { CustomizableMenuSettings } from '../../types/settings'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function requestCustomizableMenuData() {
  ipcRenderer.send(ElectronAPIEventKeys.CustomizableMenuSettingsRequest)
}

export function customizableMenuDataUpdate(
  key: keyof CustomizableMenuSettings,
  visibility: boolean
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.CustomizableMenuSettingsUpdate,
    key,
    visibility
  )
}

export function notificationCustomizableMenuData(
  callback: (value: CustomizableMenuSettings) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: CustomizableMenuSettings
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.CustomizableMenuSettingsResponse,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.CustomizableMenuSettingsResponse,
        customCallback
      ),
  }
}
