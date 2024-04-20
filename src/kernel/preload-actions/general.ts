import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

/**
 * General Methods
 */

export function openExternalURL(url: string) {
  ipcRenderer.send(ElectronAPIEventKeys.OpenExternalURL, url)
}

export function requestAccounts() {
  ipcRenderer.send(ElectronAPIEventKeys.RequestAccounts)
}

export function closeWindow() {
  ipcRenderer.send(ElectronAPIEventKeys.CloseWindow)
}

export function minimizeWindow() {
  ipcRenderer.send(ElectronAPIEventKeys.MinimizeWindow)
}
