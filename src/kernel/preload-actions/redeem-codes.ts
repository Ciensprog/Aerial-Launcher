import type { IpcRendererEvent } from 'electron'
import type { AccountData } from '../../types/accounts'
import type { RedeemCodeAccountNotification } from '../../types/redeem-codes'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

export function redeemCodes(
  accounts: Array<AccountData>,
  codes: Array<string>
) {
  ipcRenderer.send(ElectronAPIEventKeys.RedeemCodesRedeem, accounts, codes)
}

export function redeemCodesNotification(
  callback: (value: RedeemCodeAccountNotification) => Promise<void>
) {
  const customCallback = (
    _: IpcRendererEvent,
    value: RedeemCodeAccountNotification
  ) => {
    callback(value).catch(() => {})
  }
  const rendererInstance = ipcRenderer.on(
    ElectronAPIEventKeys.RedeemCodesRedeenNotification,
    customCallback
  )

  return {
    removeListener: () =>
      rendererInstance.removeListener(
        ElectronAPIEventKeys.RedeemCodesRedeenNotification,
        customCallback
      ),
  }
}
