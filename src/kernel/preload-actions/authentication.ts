import type { IpcRendererEvent } from 'electron'
import type { AuthenticationByDeviceProperties } from '../../types/authentication'
import type {
  AuthCallbackFunction,
  AuthCallbackResponseParam,
} from '../../types/preload'

import { ipcRenderer } from 'electron'

import { electronAPIEventKeys } from '../../config/constants/main-process'

/**
 * Authentication
 */

export function createAuthWithExchange(code: string) {
  ipcRenderer.send(electronAPIEventKeys.createAuthWithExchange, code)
}

export function responseAuthWithExchange(callback: AuthCallbackFunction) {
  const customCallback = (
    _: IpcRendererEvent,
    values: AuthCallbackResponseParam
  ) => {
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
}

export function createAuthWithAuthorization(code: string) {
  ipcRenderer.send(electronAPIEventKeys.createAuthWithAuthorization, code)
}

export function responseAuthWithAuthorization(
  callback: AuthCallbackFunction
) {
  const customCallback = (
    _: IpcRendererEvent,
    values: AuthCallbackResponseParam
  ) => {
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
}

export function createAuthWithDevice(
  data: AuthenticationByDeviceProperties
) {
  ipcRenderer.send(electronAPIEventKeys.createAuthWithDevice, data)
}

export function responseAuthWithDevice(callback: AuthCallbackFunction) {
  const customCallback = (
    _: IpcRendererEvent,
    values: AuthCallbackResponseParam
  ) => {
    callback(values).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    electronAPIEventKeys.responseAuthWithDevice,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        electronAPIEventKeys.responseAuthWithDevice,
        customCallback
      ),
  }
}
