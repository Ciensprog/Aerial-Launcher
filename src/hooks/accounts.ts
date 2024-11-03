import type { AccountDataRecord } from '../types/accounts'

import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useShallow } from 'zustand/react/shallow'

import {
  AddAccountsLoadingsState,
  useAddAccountsStore,
} from '../state/accounts/add'
import { useAccountListStore } from '../state/accounts/list'

export function useGetSelectedAccount() {
  const { selected } = useAccountListStore(
    useShallow((state) => ({
      currentSelected: state.selected,
      selected: state.getSelected(),
    }))
  )

  return { selected }
}

export function useGetAccounts() {
  const { accountList, idsList } = useAccountListStore(
    useShallow((state) => ({
      accountList: state.accounts,
      idsList: state.idsList,
    }))
  )
  const accountsArray = Object.values(accountList)

  return { accountsArray, accountList, idsList }
}

export function useRemoveSelectedAccount() {
  const removeAccount = useAccountListStore((state) => state.remove)

  return { removeAccount }
}

export function useRegisterAccounts() {
  const { accounts, idsList, registerAccounts } = useAccountListStore(
    useShallow((state) => ({
      accounts: state.accounts,
      idsList: state.idsList,
      registerAccounts: state.register,
    }))
  )

  const reorderAccounts = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = idsList.indexOf(active.id as string)
      const newIndex = idsList.indexOf((over?.id as string) ?? '')

      const newOrderIds = arrayMove(idsList, oldIndex, newIndex)
      const newRecord = newOrderIds.reduce((accumulator, accountId) => {
        if (accountId) {
          accumulator[accountId] = accounts[accountId]
        }

        return accumulator
      }, {} as AccountDataRecord)

      registerAccounts(newRecord, true)
      window.electronAPI.syncAccountsOrdering(newRecord)
    }
  }

  return { idsList, registerAccounts, reorderAccounts }
}

export function useAddAccountUpdateSubmittingState(
  type: keyof AddAccountsLoadingsState
) {
  const { isSubmitting, updateLoadingStatus } = useAddAccountsStore(
    useShallow((state) => ({
      isSubmitting: state[type],
      updateLoadingStatus: state.updateLoadingStatus,
    }))
  )

  const updateSubmittingState = (value: boolean) => {
    updateLoadingStatus(type, value)
  }

  return { isSubmitting, updateSubmittingState }
}
