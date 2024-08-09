import type {
  AutomationAccountData,
  AutomationAccountDataList,
} from '../../types/automation'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export type AutomationState = {
  accounts: AutomationAccountDataList

  addOrUpdateAccount: (
    accountId: string,
    defaultConfig?: Partial<{
      actions: Partial<AutomationAccountData['actions']>
      status: Partial<AutomationAccountData['status']>
      submittings: Partial<AutomationAccountData['submittings']>
    }>
  ) => void
  refreshAccounts: (
    data: Record<
      string,
      Omit<AutomationAccountData, 'submittings'> &
        Partial<{
          submittings: Partial<AutomationAccountData['submittings']>
        }>
    >
  ) => void
  removeAccount: (accountId: string) => void
  removeAllAccounts: () => void
  updateAccountAction: (
    type: keyof AutomationAccountData['actions'],
    config: {
      accountId: string
      value: boolean
    }
  ) => void
  updateAccountStatus: (
    accountId: string,
    value: AutomationAccountData['status']
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

    addOrUpdateAccount: (accountId, defaultConfig) => {
      set((state) => {
        const current = state.accounts[accountId] ?? {}

        state.accounts[accountId] = {
          accountId,
          actions: {
            claim:
              defaultConfig?.actions?.claim ??
              current?.actions?.claim ??
              false,
            kick:
              defaultConfig?.actions?.kick ??
              current?.actions?.kick ??
              false,
          },
          status: defaultConfig?.status ?? current?.status ?? null,
          submittings: {
            connecting:
              defaultConfig?.submittings?.connecting ??
              current?.submittings?.connecting ??
              false,
            removing:
              defaultConfig?.submittings?.removing ??
              current?.submittings?.removing ??
              false,
          },
        }
      })
    },
    refreshAccounts: (data) => {
      const accounts = get().accounts
      const filteredAccounts = Object.values(data)
        .map((account) => ({
          ...accounts[account.accountId],
        }))
        .reduce((accumulator, current) => {
          accumulator[current.accountId] = current

          return accumulator
        }, {} as AutomationAccountDataList)

      set({
        accounts: filteredAccounts,
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
    removeAllAccounts: () => {
      set({ accounts: {} })
    },
    updateAccountAction: (type, config) => {
      set((state) => {
        state.accounts[config.accountId].actions[type] = config.value
      })
    },
    updateAccountStatus: (accountId, value) => {
      set((state) => {
        state.accounts[accountId].status = value
      })
    },
    updateAccountSubmitting: (type, config) => {
      set((state) => {
        state.accounts[config.accountId].submittings[type] = config.value
      })
    },
  }))
)
