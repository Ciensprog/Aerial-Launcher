import type { IpcRendererEvent } from 'electron'
import type { AutoPinUrnDataList } from '../../types/urns'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function autoPinUrnsRequestData() {
  ipcRenderer.send(ElectronAPIEventKeys.UrnsServiceRequestData)
}

export function autoPinUrnsAdd(accountId: string) {
  ipcRenderer.send(ElectronAPIEventKeys.UrnsServiceAdd, accountId)
}

export function autoPinUrnsUpdate(
  accountId: string,
  type: 'mini-bosses' | 'urns',
  value: boolean
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.UrnsServiceUpdate,
    accountId,
    type,
    value
  )
}

export function autoPinUrnsRemove(accountId: string) {
  ipcRenderer.send(ElectronAPIEventKeys.UrnsServiceRemove, accountId)
}

export function notificationAutoPinUrnsData(
  callback: (value: {
    urns: AutoPinUrnDataList
    miniBosses: AutoPinUrnDataList
  }) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: {
      urns: AutoPinUrnDataList
      miniBosses: AutoPinUrnDataList
    }
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.UrnsServiceResponseData,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.UrnsServiceResponseData,
        customCallback
      ),
  }
}
