// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'

import { electronAPIEventKeys } from '../config/constants/main-process'

export const availableElectronAPIs = {
  openExternalURL: (url: string) => {
    ipcRenderer.send(electronAPIEventKeys.openExternalURL, url)
  },
} as const

contextBridge.exposeInMainWorld('electronAPI', availableElectronAPIs)
