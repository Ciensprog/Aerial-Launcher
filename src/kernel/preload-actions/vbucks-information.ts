import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../types/accounts'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { VBucksInformationState } from '../../state/management/vbucks-information'

export function getVBucksInformation(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.VBucksInformationRequest, accounts)
}

export function getVBucksInformationNotification(
  callback: (value: VBucksInformationState['data']) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: VBucksInformationState['data']
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.VBucksInformationResponseData,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.VBucksInformationResponseData,
        customCallback
      ),
  }
}
