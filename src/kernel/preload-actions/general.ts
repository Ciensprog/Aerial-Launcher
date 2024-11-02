import type { IpcRendererEvent } from 'electron'
import type { DevSettings, Settings } from '../../types/settings'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function requestAccounts() {
  ipcRenderer.send(ElectronAPIEventKeys.RequestAccounts)
}

export function requestDevSettings() {
  ipcRenderer.send(ElectronAPIEventKeys.DevSettingsRequest)
}

export function requestSettings() {
  ipcRenderer.send(ElectronAPIEventKeys.RequestSettings)
}

export function updateSettings(settings: Settings) {
  ipcRenderer.send(ElectronAPIEventKeys.UpdateSettings, settings)
}

export function notificationDevSettings(
  callback: (value: DevSettings) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, value: DevSettings) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.DevSettingsResponse,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.DevSettingsResponse,
        customCallback
      ),
  }
}

export function responseSettings(
  callback: (value: Settings) => Promise<void>
) {
  const customCallback = (_: IpcRendererEvent, value: Settings) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.OnLoadSettings,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.OnLoadSettings,
        customCallback
      ),
  }
}

export function openExternalURL(url: string) {
  ipcRenderer.send(ElectronAPIEventKeys.OpenExternalURL, url)
}

export function closeWindow() {
  ipcRenderer.send(ElectronAPIEventKeys.CloseWindow)
}

export function minimizeWindow() {
  ipcRenderer.send(ElectronAPIEventKeys.MinimizeWindow)
}
