import type {
  CollectionBookAccountData,
  CollectionBookActionResult,
} from '../../types/collection-book'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export type CollectionBookState = {
  accounts: Array<string>
  tags: Array<string>
  isLoading: boolean
  isActing: boolean
  data: Record<string, CollectionBookAccountData>
  lastResult: CollectionBookActionResult | null
  targetLevel: number

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  updateLoading: (state: boolean) => void
  updateActing: (state: boolean) => void
  updateData: (value: CollectionBookAccountData, reset?: boolean) => void
  clearData: () => void
  setLastResult: (result: CollectionBookActionResult | null) => void
  setTargetLevel: (level: number) => void
}

export const useCollectionBookStore = create<CollectionBookState>()(
  immer((set) => ({
    accounts: [],
    tags: [],
    isLoading: false,
    isActing: false,
    data: {},
    lastResult: null,
    targetLevel: 50,

    updateAccounts: (accountIds) =>
      set({
        accounts: [...new Set(accountIds)],
      }),
    updateTags: (tags) =>
      set({
        tags: [...new Set(tags)],
      }),
    updateLoading: (state) => set({ isLoading: state }),
    updateActing: (state) => set({ isActing: state }),
    updateData: (value, reset) => {
      if (reset === true) {
        set({ data: {} })
      } else {
        set((state) => {
          state.data[value.accountId] = value
        })
      }
    },
    clearData: () => set({ data: {}, lastResult: null }),
    setLastResult: (result) => set({ lastResult: result }),
    setTargetLevel: (level) =>
      set({
        targetLevel: Math.max(1, Math.min(60, Math.floor(level || 1))),
      }),
  })),
)
