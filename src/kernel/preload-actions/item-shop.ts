import type { AccountData } from '../../types/accounts'
import type {
  ItemShopAccountInfo,
  ItemShopActionResult,
  ItemShopCatalogResponse,
  ItemShopCreatorCodeRequest,
  ItemShopGiftHistoryEntry,
  ItemShopGiftRequest,
  ItemShopGiftResultPayload,
  ItemShopPurchaseRequest,
} from '../../types/item-shop'

import { ipcRenderer } from 'electron'

import { ElectronAPIEventKeys } from '../../config/constants/main-process'

import { createElectronNotification } from '../../lib/electron-notifications'

export function itemShopLoadCache() {
  ipcRenderer.send(ElectronAPIEventKeys.ItemShopLoadCache)
}

export function itemShopRequestGiftHistory() {
  ipcRenderer.send(ElectronAPIEventKeys.ItemShopGiftHistoryRequest)
}

export function itemShopRequestCatalog(account: AccountData) {
  ipcRenderer.send(ElectronAPIEventKeys.ItemShopCatalogRequest, account)
}

export function itemShopRequestAccounts(accounts: Array<AccountData>) {
  ipcRenderer.send(ElectronAPIEventKeys.ItemShopAccountsRequest, accounts)
}

export function itemShopApplyCreatorCode(data: ItemShopCreatorCodeRequest) {
  ipcRenderer.send(ElectronAPIEventKeys.ItemShopCreatorCode, data)
}

export function itemShopPurchase(data: ItemShopPurchaseRequest) {
  ipcRenderer.send(ElectronAPIEventKeys.ItemShopPurchase, data)
}

export function itemShopGift(data: ItemShopGiftRequest) {
  ipcRenderer.send(ElectronAPIEventKeys.ItemShopGift, data)
}

export const itemShopCatalogResponse = createElectronNotification<
  [ItemShopCatalogResponse]
>({
  key: ElectronAPIEventKeys.ItemShopCatalogResponse,
})

export const itemShopAccountResponse = createElectronNotification<
  [ItemShopAccountInfo]
>({
  key: ElectronAPIEventKeys.ItemShopAccountResponse,
})

export const itemShopAccountsDone = createElectronNotification<[]>(
  {
    key: ElectronAPIEventKeys.ItemShopAccountsDone,
  }
)

export const itemShopCreatorCodeResult = createElectronNotification<
  [Array<ItemShopActionResult>]
>({
  key: ElectronAPIEventKeys.ItemShopCreatorCodeResult,
})

export const itemShopPurchaseResult = createElectronNotification<
  [ItemShopGiftResultPayload]
>({
  key: ElectronAPIEventKeys.ItemShopPurchaseResult,
})

export const itemShopGiftResult = createElectronNotification<
  [ItemShopGiftResultPayload]
>({
  key: ElectronAPIEventKeys.ItemShopGiftResult,
})

export const itemShopGiftHistoryResponse = createElectronNotification<
  [Array<ItemShopGiftHistoryEntry>]
>({
  key: ElectronAPIEventKeys.ItemShopGiftHistoryResponse,
})
