import type { AccountData } from '../../types/accounts'
import type {
  CollectionBookAccountData,
  CollectionBookActionResult,
  CollectionBookSlotRequest,
  CollectionBookUpgradeRequest,
} from '../../types/collection-book'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { createElectronNotification } from '../../lib/electron-notifications'

export function collectionBookRequestData(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.CollectionBookRequestData, accounts)
}

export function collectionBookUpgrade(data: CollectionBookUpgradeRequest) {
  ipcRenderer.send(ElectronAPIEventKeys.CollectionBookUpgrade, data)
}

export function collectionBookSlot(data: CollectionBookSlotRequest) {
  ipcRenderer.send(ElectronAPIEventKeys.CollectionBookSlot, data)
}

export const collectionBookResponseData = createElectronNotification<
  [CollectionBookAccountData]
>({
  key: ElectronAPIEventKeys.CollectionBookResponseData,
})

export const collectionBookLoadingDone = createElectronNotification<[]>(
  {
    key: ElectronAPIEventKeys.CollectionBookLoadingDone,
  },
)

export const collectionBookActionResult = createElectronNotification<
  [CollectionBookActionResult]
>({
  key: ElectronAPIEventKeys.CollectionBookActionResult,
})
