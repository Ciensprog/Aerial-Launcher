import type { IpcRendererEvent } from 'electron'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../config/constants/main-process'

export function createElectronNotification<
  Params extends Array<unknown>,
>(config: { key: ElectronAPIEventKeys }) {
  return (callback: (...args: Params) => Promise<void>) => {
    const customCallback = (_: IpcRendererEvent, ...args: Params) => {
      callback(...args).catch(() => {})
    }
    const rendererInstance = ipcRenderer.on(config.key, customCallback)

    return {
      removeListener: () =>
        rendererInstance.removeListener(config.key, customCallback),
    }
  }
}
