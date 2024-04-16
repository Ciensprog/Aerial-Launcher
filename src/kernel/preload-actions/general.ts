import { ipcRenderer } from 'electron'

import { electronAPIEventKeys } from '../../config/constants/main-process'

/**
 * General Methods
 */

export function openExternalURL(url: string) {
  ipcRenderer.send(electronAPIEventKeys.openExternalURL, url)
}

export function requestAccounts() {
  ipcRenderer.send(electronAPIEventKeys.requestAccounts)
}
