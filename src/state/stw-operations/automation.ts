import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

import { AutomationStatusType } from '../../config/constants/automation'

export type AutomationAccountData = {
  accountId: string
  actions: {
    claim: boolean
    kick: boolean
  }
  submittings: {
    connecting: boolean
    removing: boolean
  }
  status: AutomationStatusType | null
}

export type AutomationAccountDataList = Record<
  string,
  AutomationAccountData
>

export type AutomationState = {
  accounts: AutomationAccountDataList

  addAccount: (accountId: string) => void
  removeAccount: (accountId: string) => void
  updateAccountAction: (
    type: keyof AutomationAccountData['actions'],
    config: {
      accountId: string
      value: boolean
    }
  ) => void
  updateAccountSubmitting: (
    type: keyof AutomationAccountData['submittings'],
    config: {
      accountId: string
      value: boolean
    }
  ) => void
}

export const useAutomationStore = create<AutomationState>()(
  immer((set, get) => ({
    accounts: {},

    addAccount: (accountId) => {
      set((state) => {
        state.accounts[accountId] = {
          accountId,
          actions: {
            claim: false,
            kick: false,
          },
          status: null,
          submittings: {
            connecting: false,
            removing: false,
          },
        }
      })
    },
    removeAccount: (accountId) => {
      const accounts = Object.values(get().accounts)
      const filtered = accounts
        .filter((account) => account.accountId !== accountId)
        .reduce((accumulator, current) => {
          accumulator[current.accountId] = current

          return accumulator
        }, {} as AutomationAccountDataList)

      set({
        accounts: filtered,
      })
    },
    updateAccountAction: (type, config) => {
      set((state) => {
        state.accounts[config.accountId].actions[type] = config.value
      })
    },
    updateAccountSubmitting: (type, config) => {
      set((state) => {
        state.accounts[config.accountId].submittings[type] = config.value
      })
    },
  }))
)
