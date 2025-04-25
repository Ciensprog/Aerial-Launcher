import type { AutoLlamasRecord } from '../../types/auto-llamas'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import {
  AutoLlamasAccountAddParams,
  AutoLlamasAccountUpdateParams,
} from '../../state/stw-operations/auto/llamas'

import { createElectronNotification } from '../../lib/electron-notifications'

export function autoLlamasLoadAccounts() {
  ipcRenderer.send(ElectronAPIEventKeys.AutoLlamasLoadAccountsRequest)
}

export function autoLlamasAccountAdd(data: AutoLlamasAccountAddParams) {
  ipcRenderer.send(ElectronAPIEventKeys.AutoLlamasAccountAdd, data)
}

export function autoLlamasAccountUpdate(
  data: AutoLlamasAccountUpdateParams
) {
  ipcRenderer.send(ElectronAPIEventKeys.AutoLlamasAccountUpdate, data)
}

export function autoLlamasAccountRemove(data: Array<string> | null) {
  ipcRenderer.send(ElectronAPIEventKeys.AutoLlamasAccountRemove, data)
}

export function autoLlamasCheck() {
  ipcRenderer.send(ElectronAPIEventKeys.AutoLlamasAccountCheck)
}

export const autoLlamasLoadAccountsResponse = createElectronNotification<
  [AutoLlamasRecord]
>({
  key: ElectronAPIEventKeys.AutoLlamasLoadAccountsResponse,
})

export function notificationAutoLlamasCheckLoading(
  callback: () => Promise<void>
) {
  const customCallback = () => {
    callback().catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.AutoLlamasAccountCheckLoading,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.AutoLlamasAccountCheckLoading,
        customCallback
      ),
  }
}
