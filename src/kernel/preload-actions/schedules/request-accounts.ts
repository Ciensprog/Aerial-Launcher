import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../../types/accounts'
import type { AntiCheatProviderCallbackResponseParam } from '../../../types/preload'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../../config/constants/main-process'

export function scheduleResponseAccounts(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.ScheduleResponseAccounts, accounts)
}

// export function scheduleRequestAccounts(callback: () => Promise<void>) {
//   const eventKey = ElectronAPIEventKeys.ScheduleRequestAccounts
//   const customCallback = () => {
//     callback().catch(() => {})
//   }
//   const rendererInstance = ipcRenderer.on(eventKey, customCallback)

//   return {
//     removeListener: () =>
//       rendererInstance.removeListener(eventKey, customCallback),
//   }
// }

export function scheduleResponseProviders(
  callback: (
    response: AntiCheatProviderCallbackResponseParam
  ) => Promise<void>
) {
  const eventKey = ElectronAPIEventKeys.ScheduleResponseProviders
  const customCallback = (
    _: IpcRendererEvent,
    response: AntiCheatProviderCallbackResponseParam
  ) => {
    callback(response).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(eventKey, customCallback)

  return {
    removeListener: () =>
      rendererInstance.removeListener(eventKey, customCallback),
  }
}
