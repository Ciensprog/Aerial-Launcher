import type { XPBoostsDataWithAccountData } from '../../../types/xpboosts'

import { create } from 'zustand'

export type XPBoostsDataState = {
  amountToSend: string
  data: Array<XPBoostsDataWithAccountData>

  updateAmountToSend: (value: string) => void
  updateAvailability: (accountId: string, value: boolean) => void
  updateData: (value: Array<XPBoostsDataWithAccountData>) => void
}

export const useXPBoostsDataStore = create<XPBoostsDataState>()(
  (set, get) => ({
    amountToSend: '',
    data: [],

    updateAmountToSend: (amountToSend) => set({ amountToSend }),
    updateAvailability: (accountId, available) => {
      const newData = get().data.map((item) => {
        if (accountId === item.accountId) {
          return {
            ...item,
            available,
          }
        }

        return item
      })

      set({ data: newData })
    },
    updateData: (data) => {
      const asObject = get().data.reduce(
        (accumulator, current) => {
          accumulator[current.accountId] = current

          return accumulator
        },
        {} as Record<string, XPBoostsDataWithAccountData>
      )
      const newData = data.map((item) => {
        const current = asObject[item.accountId]

        if (current) {
          return {
            ...item,
            available: current.available,
          }
        }

        return item
      })

      set({ data: newData })
    },
  })
)
