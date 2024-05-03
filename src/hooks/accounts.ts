import { useShallow } from 'zustand/react/shallow'

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
