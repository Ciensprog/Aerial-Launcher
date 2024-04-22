import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../types/accounts'
import type {
  AntiCheatProviderCallbackResponseParam,
  NewVersionStatusCallbackResponseParam,
} from '../../types/preload'

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
    response: AntiCheatProviderCallbackResponseParam
  ) => {
    callback(response).catch(() => {})
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

export function requestNewVersionStatus() {
  ipcRenderer.send(ElectronAPIEventKeys.RequestNewVersionStatus)
}

export function responseNewVersionStatus(
  callback: (
    response: NewVersionStatusCallbackResponseParam
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    response: NewVersionStatusCallbackResponseParam
  ) => {
    callback(response).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.ResponseNewVersionStatus,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.ResponseNewVersionStatus,
        customCallback
      ),
  }
}
