// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import type { IpcRendererEvent } from 'electron'
import type { AccountDataRecord } from '../types/accounts'
import type { AuthCallbackFunction } from '../types/preload'

import { contextBridge, ipcRenderer } from 'electron'

import { electronAPIEventKeys } from '../config/constants/main-process'

export const availableElectronAPIs = {
  /**
   * General Methods
   */

  openExternalURL: (url: string) => {
    ipcRenderer.send(electronAPIEventKeys.openExternalURL, url)
  },

  requestAccounts: () => {
    ipcRenderer.send(electronAPIEventKeys.requestAccounts)
  },

  /**
   * Events
   */

  onAccountsLoaded: (
    callback: (values: AccountDataRecord) => Promise<void>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customCallback = (_: IpcRendererEvent, values: any) => {
      callback(values).catch(() => {})
    }
    const rendererInstance = ipcRenderer.on(
      electronAPIEventKeys.onAccountsLoaded,
      customCallback
    )

    return {
      removeListener: () =>
        rendererInstance.removeListener(
          electronAPIEventKeys.onAccountsLoaded,
          customCallback
        ),
    }
  },

  onRemoveAccount: (accountId: string) => {
    if (typeof accountId !== 'string') {
      return
    }

    ipcRenderer.send(electronAPIEventKeys.onRemoveAccount, accountId)
  },

  /**
   * Authentication
   */

  createAuthWithExchange: (code: string) => {
    ipcRenderer.send(electronAPIEventKeys.createAuthWithExchange, code)
  },
  responseAuthWithExchange: (callback: AuthCallbackFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customCallback = (_: IpcRendererEvent, values: any) => {
      callback(values).catch(() => {})
    }
    const rendererInstance = ipcRenderer.on(
      electronAPIEventKeys.responseAuthWithExchange,
      customCallback
    )

    return {
      removeListener: () =>
        rendererInstance.removeListener(
          electronAPIEventKeys.responseAuthWithExchange,
          customCallback
        ),
    }
  },

  createAuthWithAuthorization: (code: string) => {
    ipcRenderer.send(
      electronAPIEventKeys.createAuthWithAuthorization,
      code
    )
  },
  responseAuthWithAuthorization: (callback: AuthCallbackFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customCallback = (_: IpcRendererEvent, values: any) => {
      callback(values).catch(() => {})
    }
    const rendererInstance = ipcRenderer.on(
      electronAPIEventKeys.responseAuthWithAuthorization,
      customCallback
    )

    return {
      removeListener: () =>
        rendererInstance.removeListener(
          electronAPIEventKeys.responseAuthWithAuthorization,
          customCallback
        ),
    }
  },
} as const

contextBridge.exposeInMainWorld('electronAPI', availableElectronAPIs)
