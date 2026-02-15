import type { IpcRendererEvent } from 'electron'
import type {
  TaxiServiceServiceActionConfig,
  TaxiServiceServiceStatusResponse,
} from '../../types/taxi-service'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import {
  TaxiServiceNotificationEventFriendAdded,
  TaxiServiceNotificationEventFriendRequestSend,
  TaxiServiceNotificationEventPartyInvite,
  TaxiServiceNotificationEventPartyMemberJoined,
  TaxiServiceState,
} from '../../state/stw-operations/taxi-service'

export function taxiServiceAddAccounts(
  origin: Array<string>,
  destination: Array<string>,
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.TaxiServiceServiceAddAccounts,
    origin,
    destination,
  )
}

export function taxiServiceServiceRequestData() {
  ipcRenderer.send(ElectronAPIEventKeys.TaxiServiceServiceRequestData)
}

export function taxiServiceServiceStart(accountId: string) {
  ipcRenderer.send(ElectronAPIEventKeys.TaxiServiceServiceStart, accountId)
}

export function taxiServiceServiceReload(ids: Array<string>) {
  ipcRenderer.send(ElectronAPIEventKeys.TaxiServiceServiceReload, ids)
}

export function taxiServiceServiceRemove(accountId: string) {
  ipcRenderer.send(
    ElectronAPIEventKeys.TaxiServiceServiceRemove,
    accountId,
  )
}

export function taxiServiceServiceUpdateAction(
  accountId: string,
  config: TaxiServiceServiceActionConfig,
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.TaxiServiceServiceActionUpdate,
    accountId,
    config,
  )
}

export function notificationTaxiServiceServiceData(
  callback: (
    value: Parameters<TaxiServiceState['refreshAccounts']>[0],
    onlyUpdate: boolean,
  ) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Parameters<TaxiServiceState['refreshAccounts']>[0],
    onlyUpdate: boolean,
  ) => {
    callback(value, onlyUpdate).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.TaxiServiceServiceResponseData,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.TaxiServiceServiceResponseData,
        customCallback,
      ),
  }
}

export function notificationTaxiServiceServiceStart(
  callback: (
    value: TaxiServiceServiceStatusResponse,
    refresh?: boolean,
  ) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: TaxiServiceServiceStatusResponse,
    refresh?: boolean,
  ) => {
    callback(value, refresh).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.TaxiServiceServiceStartNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.TaxiServiceServiceStartNotification,
        customCallback,
      ),
  }
}

// export function notificationTaxiServiceServiceReload(
//   callback: (value: TaxiServiceServiceStatusResponse) => Promise<void>
// ) {
//   const customCallback = (
//     _: IpcRendererEvent,
//     value: TaxiServiceServiceStatusResponse
//   ) => {
//     callback(value).catch(() => {})
//   }
//   const rendererInstance = ipcRenderer.on(
//     ElectronAPIEventKeys.TaxiServiceServiceReloadNotification,
//     customCallback
//   )

//   return {
//     removeListener: () =>
//       rendererInstance.removeListener(
//         ElectronAPIEventKeys.TaxiServiceServiceReloadNotification,
//         customCallback
//       ),
//   }
// }

export function notificationTaxiServiceServiceRemove(
  callback: (value: string) => Promise<void>,
) {
  const customCallback = (_: IpcRendererEvent, value: string) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.TaxiServiceServiceRemoveNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.TaxiServiceServiceRemoveNotification,
        customCallback,
      ),
  }
}

export function taxiServiceServiceNotifications(
  callback: (
    notifications:
      | TaxiServiceNotificationEventFriendAdded
      | TaxiServiceNotificationEventFriendRequestSend
      | TaxiServiceNotificationEventPartyInvite
      | TaxiServiceNotificationEventPartyMemberJoined,
  ) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    notifications:
      | TaxiServiceNotificationEventFriendAdded
      | TaxiServiceNotificationEventFriendRequestSend
      | TaxiServiceNotificationEventPartyInvite
      | TaxiServiceNotificationEventPartyMemberJoined,
  ) => {
    callback(notifications).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.TaxiServiceServiceNotifications,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.TaxiServiceServiceNotifications,
        customCallback,
      ),
  }
}
