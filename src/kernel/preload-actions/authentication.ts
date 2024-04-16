import type { IpcRendererEvent } from 'electron'
import type { AuthenticationByDeviceProperties } from '../../types/authentication'
import type {
  AuthCallbackFunction,
  AuthCallbackResponseParam,
} from '../../types/preload'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

/**
 * Authentication
 */

export function createAuthWithExchange(code: string) {
  ipcRenderer.send(ElectronAPIEventKeys.CreateAuthWithExchange, code)
}

export function responseAuthWithExchange(callback: AuthCallbackFunction) {
  const customCallback = (
    _: IpcRendererEvent,
    values: AuthCallbackResponseParam
  ) => {
    callback(values).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.ResponseAuthWithExchange,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.ResponseAuthWithExchange,
        customCallback
      ),
  }
}

export function createAuthWithAuthorization(code: string) {
  ipcRenderer.send(ElectronAPIEventKeys.CreateAuthWithAuthorization, code)
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
    ElectronAPIEventKeys.ResponseAuthWithAuthorization,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.ResponseAuthWithAuthorization,
        customCallback
      ),
  }
}

export function createAuthWithDevice(
  data: AuthenticationByDeviceProperties
) {
  ipcRenderer.send(ElectronAPIEventKeys.CreateAuthWithDevice, data)
}

export function responseAuthWithDevice(callback: AuthCallbackFunction) {
  const customCallback = (
    _: IpcRendererEvent,
    values: AuthCallbackResponseParam
  ) => {
    callback(values).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.ResponseAuthWithDevice,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.ResponseAuthWithDevice,
        customCallback
      ),
  }
}
