import type {
  ItemShopAccountInfo,
  ItemShopCatalogResponse,
  ItemShopGiftHistoryEntry,
} from '../../types/item-shop'

import { create } from 'zustand'

export type ItemShopState = {
  accounts: Array<string>
  tags: Array<string>
  catalog: ItemShopCatalogResponse
  accountInfo: Record<string, ItemShopAccountInfo>
  isLoadingCatalog: boolean
  isLoadingAccounts: boolean
  isActing: boolean
  gifts: Array<ItemShopGiftHistoryEntry>

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  setCatalog: (catalog: ItemShopCatalogResponse) => void
  setAccountInfo: (info: ItemShopAccountInfo) => void
  setLoadingCatalog: (value: boolean) => void
  setLoadingAccounts: (value: boolean) => void
  setActing: (value: boolean) => void
  setGifts: (gifts: Array<ItemShopGiftHistoryEntry>) => void
  prependGifts: (gifts: Array<ItemShopGiftHistoryEntry>) => void
}

export const useItemShopStore = create<ItemShopState>()((set) => ({
  accounts: [],
  tags: [],
  catalog: {
    shopDate: null,
    expiration: null,
    fetchedAt: null,
    newShopAvailable: false,
    offers: [],
    sections: [],
  },
  accountInfo: {},
  isLoadingCatalog: false,
  isLoadingAccounts: false,
  isActing: false,
  gifts: [],

  updateAccounts: (accounts) => set({ accounts: [...new Set(accounts)] }),
  updateTags: (tags) => set({ tags: [...new Set(tags)] }),
  setCatalog: (catalog) => set({ catalog, isLoadingCatalog: false }),
  setAccountInfo: (info) =>
    set((state) => ({
      accountInfo: {
        ...state.accountInfo,
        [info.accountId]: info,
      },
    })),
  setLoadingCatalog: (isLoadingCatalog) => set({ isLoadingCatalog }),
  setLoadingAccounts: (isLoadingAccounts) => set({ isLoadingAccounts }),
  setActing: (isActing) => set({ isActing }),
  setGifts: (gifts) => set({ gifts }),
  prependGifts: (gifts) =>
    set((state) => ({
      gifts: [...gifts, ...state.gifts].slice(0, 500),
    })),
}))
