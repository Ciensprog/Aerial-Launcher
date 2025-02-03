import type { AutoLlamasData } from '../../../types/auto-llamas'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export enum AutoLlamasBulkAction {
  EnableBuy = 'enable-buy',
  DisableBuy = 'disable-buy',
}

export type AutoLlamasAccountAddParams = Record<
  string,
  {
    accountId: string
    actions?: Partial<AutoLlamasData['actions']>
  }
>
export type AutoLlamasAccountUpdateParams =
  | Record<
      string,
      {
        accountId: string
        config: {
          type: keyof AutoLlamasData['actions']
          value: boolean | 'toggle'
        }
      }
    >
  | AutoLlamasBulkAction

export type AutoLlamasState = {
  accounts: Record<string, AutoLlamasData>

  addAccounts: (data: AutoLlamasAccountAddParams) => void
  removeAccounts: (accountIds: Array<string> | null) => void
  updateAccounts: (accounts: AutoLlamasAccountUpdateParams) => void
}

export const useAutoLlamaStore = create<AutoLlamasState>()(
  immer((set, get) => ({
    accounts: {},

    addAccounts: (accounts) => {
      set({
        accounts: {
          ...get().accounts,
          ...Object.values(accounts).reduce(
            (accumulator, current) => {
              accumulator[current.accountId] = {
                accountId: current.accountId,
                actions: {
                  survivors: current.actions?.survivors ?? false,
                },
              }

              return accumulator
            },
            {} as AutoLlamasState['accounts']
          ),
        },
      })
    },
    removeAccounts: (accountIds) => {
      if (accountIds === null) {
        return set({ accounts: {} })
      }

      const accounts = Object.entries(get().accounts).reduce(
        (accumulator, [accountId, value]) => {
          if (!accountIds.includes(accountId)) {
            accumulator[accountId] = value
          }

          return accumulator
        },
        {} as AutoLlamasState['accounts']
      )

      set({ accounts })
    },
    updateAccounts: (accounts) => {
      const currentAccounts = get().accounts

      if (
        accounts === AutoLlamasBulkAction.EnableBuy ||
        accounts === AutoLlamasBulkAction.DisableBuy
      ) {
        const newValue = Object.values(currentAccounts).reduce(
          (accumulator, value) => {
            accumulator[value.accountId] = value
            accumulator[value.accountId].actions.survivors =
              accounts === AutoLlamasBulkAction.EnableBuy

            return accumulator
          },
          {} as AutoLlamasState['accounts']
        )

        set({ accounts: newValue })

        return
      }

      const list = Object.entries(accounts).reduce(
        (accumulator, [accountId, { config }]) => {
          accumulator[accountId] = currentAccounts[accountId]
          accumulator[accountId].actions[config.type] =
            config.value === 'toggle'
              ? !accumulator[accountId].actions[config.type]
              : config.value

          return accumulator
        },
        {} as AutoLlamasState['accounts']
      )

      set({
        accounts: {
          ...currentAccounts,
          ...list,
        },
      })
    },
  }))
)
