import { useShallow } from 'zustand/react/shallow'

import { useAutoPinUrnDataStore } from '../../state/stw-operations/urns'

export function useGetAutoPinUrnData() {
  const { data, miniBosses } = useAutoPinUrnDataStore(
    useShallow((state) => ({
      data: state.data,
      miniBosses: state.miniBosses,
    }))
  )

  return {
    selectedAccounts: data,
    selectedAccountsMiniBosses: miniBosses,
  }
}

export function useGetAutoPinUrnActions() {
  const { addAccount, removeAccount, updateAccount } =
    useAutoPinUrnDataStore(
      useShallow((state) => ({
        addAccount: state.addAccount,
        removeAccount: state.removeAccount,
        updateAccount: state.updateAccount,
      }))
    )

  return {
    addAccount,
    removeAccount,
    updateAccount,
  }
}
