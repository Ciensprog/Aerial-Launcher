import type { AutoPinUrnDataList } from '../../types/urns'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export type UrnDataState = {
  data: AutoPinUrnDataList
  miniBosses: AutoPinUrnDataList

  addAccount: (
    accountId: string,
    config?: {
      type: 'mini-bosses' | 'urns'
      value: boolean
    }
  ) => void
  removeAccount: (accountId: string) => void
  updateAccount: (
    accountId: string,
    config: {
      type: 'mini-bosses' | 'urns'
      value: boolean
    }
  ) => void
}

export const useAutoPinUrnDataStore = create<UrnDataState>()(
  immer((set, get) => ({
    data: {},
    miniBosses: {},

    addAccount: (accountId, config) => {
      if (config !== undefined) {
        set((state) => {
          if (config.type === 'urns') {
            state.data[accountId] = config.value ?? false
          } else {
            state.miniBosses[accountId] = config.value ?? false
          }
        })
      } else {
        set((state) => ({
          data: {
            ...state.data,
            [accountId]: false,
          },
          miniBosses: {
            ...state.miniBosses,
            [accountId]: false,
          },
        }))
      }
    },
    removeAccount: (accountId) => {
      const newUrnsData = Object.entries(get().data)
        .filter(([currentAccountId]) => currentAccountId !== accountId)
        .reduce((accumulator, [currentAccountId, value]) => {
          accumulator[currentAccountId] = value

          return accumulator
        }, {} as AutoPinUrnDataList)
      const newMiniBossesData = Object.entries(get().miniBosses)
        .filter(([currentAccountId]) => currentAccountId !== accountId)
        .reduce((accumulator, [currentAccountId, value]) => {
          accumulator[currentAccountId] = value

          return accumulator
        }, {} as AutoPinUrnDataList)

      set({ data: newUrnsData, miniBosses: newMiniBossesData })
    },
    updateAccount: (accountId, config) => {
      set((state) => {
        if (config.type === 'mini-bosses') {
          if (state.miniBosses[accountId] !== undefined) {
            state.miniBosses[accountId] = config.value
          }
        } else {
          if (state.data[accountId] !== undefined) {
            state.data[accountId] = config.value
          }
        }
      })
    },
  }))
)
