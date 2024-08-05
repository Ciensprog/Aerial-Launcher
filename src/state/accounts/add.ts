import { create } from 'zustand'

export type AddAccountsLoadingsState = {
  authorizationCode: boolean
  deviceAuth: boolean
  exchangeCode: boolean
}

export type AddAccountsState = AddAccountsLoadingsState & {
  updateLoadingStatus: (
    type: keyof AddAccountsLoadingsState,
    value: boolean
  ) => void
}

export const useAddAccountsStore = create<AddAccountsState>()((set) => ({
  authorizationCode: false,
  deviceAuth: false,
  exchangeCode: false,

  updateLoadingStatus: (type, value) => {
    set({
      [type]: value,
    })
  },
}))
