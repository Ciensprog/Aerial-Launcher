import type { IpcRendererEvent } from 'electron'
import type { AutomationServiceStatusResponse } from '../../types/automation'

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

export function notificationAutomationServiceData(
  callback: (
    value: Parameters<AutomationState['refreshAccounts']>[0],
    onlyUpdate: boolean
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Parameters<AutomationState['refreshAccounts']>[0],
    onlyUpdate: boolean
  ) => {
    callback(value, onlyUpdate).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AutomationServiceResponseData,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AutomationServiceResponseData,
        customCallback
      ),
  }
}

export function notificationAutomationServiceStart(
  callback: (
    value: AutomationServiceStatusResponse,
    refresh?: boolean
  ) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: AutomationServiceStatusResponse,
    refresh?: boolean
  ) => {
    callback(value, refresh).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AutomationServiceStartNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AutomationServiceStartNotification,
        customCallback
      ),
  }
}

export function notificationAutomationServiceReload(
  callback: (value: AutomationServiceStatusResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: AutomationServiceStatusResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AutomationServiceReloadNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AutomationServiceReloadNotification,
        customCallback
      ),
  }
}
