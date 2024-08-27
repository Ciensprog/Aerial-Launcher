import type { IpcRendererEvent } from 'electron'
import type { DeviceAuthInfoWithStates } from '../../state/accounts/devices-auth'
import type { AccountData } from '../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function devicesAuthRequestData(account: AccountData) {
  ipcRenderer.send(ElectronAPIEventKeys.DevicesAuthRequestData, account)
}

export function devicesAuthRemove(account: AccountData, deviceId: string) {
  ipcRenderer.send(
    ElectronAPIEventKeys.DevicesAuthRemove,
    account,
    deviceId
  )
}

export function notificationDevicesAuthData(
  callback: (value: Array<DeviceAuthInfoWithStates>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<DeviceAuthInfoWithStates>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.DevicesAuthResponseData,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.DevicesAuthResponseData,
        customCallback
      ),
  }
}

export function notificationDevicesAuthRemove(
  callback: (
    account: AccountData,
    deviceId: string,
    status: boolean
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    account: AccountData,
    deviceId: string,
    status: boolean
  ) => {
    callback(account, deviceId, status).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.DevicesAuthRemoveNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.DevicesAuthRemoveNotification,
        customCallback
      ),
  }
}
