import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../types/accounts'
import type {
  XPBoostsConsumePersonalData,
  XPBoostsConsumePersonalResponse,
  XPBoostsData,
} from '../../types/xpboosts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function requestXPBoostsAccounts(accounts: Array<AccountData>) {
  ipcRenderer.send(
    ElectronAPIEventKeys.XPBoostsAccountProfileRequest,
    accounts
  )
}

export function consumePersonalXPBoosts(
  data: XPBoostsConsumePersonalData
) {
  ipcRenderer.send(ElectronAPIEventKeys.XPBoostsConsumePersonal, data)
}

export function notificationXPBoostsAccounts(
  callback: (value: Array<XPBoostsData>) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: Array<XPBoostsData>
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.XPBoostsAccountProfileResponse,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.XPBoostsAccountProfileResponse,
        customCallback
      ),
  }
}

export function notificationConsumePersonalXPBoosts(
  callback: (value: XPBoostsConsumePersonalResponse) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: XPBoostsConsumePersonalResponse
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.XPBoostsConsumePersonalNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.XPBoostsConsumePersonalNotification,
        customCallback
      ),
  }
}
