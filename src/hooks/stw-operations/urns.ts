import type { AutoPinUrnDataList } from '../../types/urns'

import { useShallow } from 'zustand/react/shallow'

import { useAutoPinUrnDataStore } from '../../state/stw-operations/urns'

import { useGetAccounts } from '../accounts'

export function useGetAutoPinUrnData() {
  const { idsList } = useGetAccounts()
  const { data, miniBosses } = useAutoPinUrnDataStore(
    useShallow((state) => ({
      data: state.data,
      miniBosses: state.miniBosses,
    }))
  )
  const selectedAccounts = idsList.reduce((accumulator, accountId) => {
    if (data[accountId] !== undefined) {
      accumulator[accountId] = data[accountId]
    }

    return accumulator
  }, {} as AutoPinUrnDataList)

  return {
    selectedAccounts,
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
