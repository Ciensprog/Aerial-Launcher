import { useShallow } from 'zustand/react/shallow'

import { useAutoPinUrnDataStore } from '../../state/stw-operations/urns'

export function useGetAutoPinUrnData() {
  const data = useAutoPinUrnDataStore((state) => state.data)

  return {
    selectedAccounts: data,
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
