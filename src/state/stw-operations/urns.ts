import type { AutoPinUrnDataList } from '../../types/urns'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export type UrnDataState = {
  data: AutoPinUrnDataList

  addAccount: (accountId: string) => void
  removeAccount: (accountId: string) => void
  updateAccount: (accountId: string, value: boolean) => void
}

export const useAutoPinUrnDataStore = create<UrnDataState>()(
  immer((set, get) => ({
    data: {},

    addAccount: (accountId) => {
      set((state) => {
        state.data[accountId] = false
      })
    },
    removeAccount: (accountId) => {
      const newData = Object.entries(get().data)
        .filter(([currentAccountId]) => currentAccountId !== accountId)
        .reduce((accumulator, [currentAccountId, value]) => {
          accumulator[currentAccountId] = value

          return accumulator
        }, {} as AutoPinUrnDataList)

      set({ data: newData })
    },
    updateAccount: (accountId, value) => {
      set((state) => {
        if (state.data[accountId] !== undefined) {
          state.data[accountId] = value
        }
      })
    },
  }))
)
