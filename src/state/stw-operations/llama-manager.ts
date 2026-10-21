import type {
  LlamaManagerAccountData,
  LlamaManagerActionResult,
} from '../../types/llama-manager'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export type LlamaManagerState = {
  accounts: Array<string>
  tags: Array<string>
  isLoading: boolean
  isActing: boolean
  data: Record<string, LlamaManagerAccountData>
  lastResult: LlamaManagerActionResult | null

  updateAccounts: (accountIds: Array<string>) => void
  updateTags: (tags: Array<string>) => void
  updateLoading: (state: boolean) => void
  updateActing: (state: boolean) => void
  updateData: (
    value: LlamaManagerAccountData,
    reset?: boolean,
  ) => void
  clearData: () => void
  setLastResult: (result: LlamaManagerActionResult | null) => void
}

export const useLlamaManagerStore = create<LlamaManagerState>()(
  immer((set) => ({
    accounts: [],
    tags: [],
    isLoading: false,
    isActing: false,
    data: {},
    lastResult: null,

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
  })),
)
