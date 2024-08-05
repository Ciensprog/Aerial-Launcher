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
  const accountList = useAccountListStore((state) => state.accounts)
  const accountsArray = Object.values(accountList)

  return { accountsArray, accountList }
}

export function useRemoveSelectedAccount() {
  const removeAccount = useAccountListStore((state) => state.remove)

  return { removeAccount }
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
