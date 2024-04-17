import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../types/accounts'
import type { AntiCheatProviderCallbackResponseParam } from '../../types/preload'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

/**
 * Requests
 */

export function requestProviderAndAccessToken(account: AccountData) {
  ipcRenderer.send(
    ElectronAPIEventKeys.RequestProviderAndAccessTokenOnStartup,
    account
  )
}

export function responseProviderAndAccessToken(
  callback: (
    response: AntiCheatProviderCallbackResponseParam
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    values: AntiCheatProviderCallbackResponseParam
  ) => {
    callback(values).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.ResponseProviderAndAccessTokenOnStartup,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.ResponseProviderAndAccessTokenOnStartup,
        customCallback
      ),
  }
}
