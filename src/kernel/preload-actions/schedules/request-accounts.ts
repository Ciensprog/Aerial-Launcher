import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../../types/accounts'
import type { AntiCheatProviderCallbackResponseParam } from '../../../types/preload'

import { ipcRenderer } from 'electron'

export function scheduleResponseAccounts(accounts: Array<AccountData>) {
  ipcRenderer.send('schedule:response:accounts', accounts)
}

export function scheduleRequestAccounts(callback: () => Promise<void>) {
  const eventKey = 'schedule:request:accounts'
  const customCallback = () => {
    callback().catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(eventKey, customCallback)

  return {
    removeListener: () =>
      rendererInstance.removeListener(eventKey, customCallback),
  }
}

export function scheduleResponseProviders(
  callback: (
    response: AntiCheatProviderCallbackResponseParam
  ) => Promise<void>
) {
  const eventKey = 'schedule:response:providers'
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
