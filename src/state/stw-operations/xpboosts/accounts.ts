import type { XPBoostsDataWithAccountData } from '../../../types/xpboosts'

import { create } from 'zustand'

export type XPBoostsDataState = {
  amountToSend: string
  data: Array<XPBoostsDataWithAccountData>

  updateAmountToSend: (value: string) => void
  updateData: (value: Array<XPBoostsDataWithAccountData>) => void
}

export const useXPBoostsDataStore = create<XPBoostsDataState>()((set) => ({
  amountToSend: '',
  data: [],

  updateAmountToSend: (amountToSend) => set({ amountToSend }),
  updateData: (data) => set({ data }),
}))
