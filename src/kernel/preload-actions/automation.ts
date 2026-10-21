import type { IpcRendererEvent } from 'electron'
import type {
  AutomationLogFileSettings,
  AutomationLogFileStatus,
  AutomationServiceActionConfig,
  AutomationServiceStatusResponse,
} from '../../types/automation'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { AutomationState } from '../../state/stw-operations/automation'

export function automationServiceRequestData() {
  ipcRenderer.send(ElectronAPIEventKeys.AutomationServiceRequestData)
}

export function automationServiceStart(accountId: string) {
  ipcRenderer.send(ElectronAPIEventKeys.AutomationServiceStart, accountId)
}

export function automationServiceReload(accountId: string) {
  ipcRenderer.send(ElectronAPIEventKeys.AutomationServiceReload, accountId)
}

export function automationServiceRemove(accountId: string) {
  ipcRenderer.send(ElectronAPIEventKeys.AutomationServiceRemove, accountId)
}

export function automationServiceUpdateAction(
  accountId: string,
  config: AutomationServiceActionConfig,
) {
  ipcRenderer.send(
    ElectronAPIEventKeys.AutomationServiceActionUpdate,
    accountId,
    config,
  )
}

export function notificationAutomationServiceData(
  callback: (
    value: Parameters<AutomationState['refreshAccounts']>[0],
    onlyUpdate: boolean,
  ) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Parameters<AutomationState['refreshAccounts']>[0],
    onlyUpdate: boolean,
  ) => {
    callback(value, onlyUpdate).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AutomationServiceResponseData,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AutomationServiceResponseData,
        customCallback,
      ),
  }
}

export function notificationAutomationServiceStart(
  callback: (
    value: AutomationServiceStatusResponse,
    refresh?: boolean,
  ) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: AutomationServiceStatusResponse,
    refresh?: boolean,
  ) => {
    callback(value, refresh).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AutomationServiceStartNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AutomationServiceStartNotification,
        customCallback,
      ),
  }
}

// export function notificationAutomationServiceReload(
//   callback: (value: AutomationServiceStatusResponse) => Promise<void>
// ) {
//   const customCallback = (
//     _: IpcRendererEvent,
//     value: AutomationServiceStatusResponse
//   ) => {
//     callback(value).catch(() => {})
//   }
//   const rendererInstance = ipcRenderer.on(
//     ElectronAPIEventKeys.AutomationServiceReloadNotification,
//     customCallback
//   )

//   return {
//     removeListener: () =>
//       rendererInstance.removeListener(
//         ElectronAPIEventKeys.AutomationServiceReloadNotification,
//         customCallback
//       ),
//   }
// }

export function notificationAutomationServiceRemove(
  callback: (value: string) => Promise<void>,
) {
  const customCallback = (_: IpcRendererEvent, value: string) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AutomationServiceRemoveNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AutomationServiceRemoveNotification,
        customCallback,
      ),
  }
}

export function requestAutomationLogFile() {
  ipcRenderer.send(ElectronAPIEventKeys.AutomationLogFileRequest)
}

export function updateAutomationLogFile(
  partial: Partial<AutomationLogFileSettings>,
) {
  ipcRenderer.send(ElectronAPIEventKeys.AutomationLogFileUpdate, partial)
}

export function pickAutomationLogFile() {
  ipcRenderer.send(ElectronAPIEventKeys.AutomationLogFilePick)
}

export function notificationAutomationLogFile(
  callback: (value: AutomationLogFileStatus) => Promise<void>,
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: AutomationLogFileStatus,
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AutomationLogFileNotification,
    customCallback,
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AutomationLogFileNotification,
        customCallback,
      ),
  }
}
