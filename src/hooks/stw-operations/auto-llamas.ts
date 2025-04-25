import { useEffect, useState } from 'react'

import {
  AutoLlamasBulkAction,
  useAutoLlamaStore,
} from '../../state/stw-operations/auto/llamas'

export function useAutoLlamaData() {
  const [checkLoading, setCheckLoading] = useState(false)
  const { selected, addAccounts, removeAccounts, updateAccounts } =
    useAutoLlamaStore((state) => ({
      selected: state.accounts,
      addAccounts: state.addAccounts,
      removeAccounts: state.removeAccounts,
      updateAccounts: state.updateAccounts,
    }))

  const totalEnabled = Object.values(selected).filter(
    (current) => current.actions['free-llamas']
  ).length
  const totalEnabledPurchases = Object.values(selected).filter(
    (current) =>
      current.actions['free-llamas'] || current.actions['survivors']
  ).length
  const isAllEnabled = totalEnabled >= Object.keys(selected).length
  const isDisableBuyButtonDisabled = totalEnabled <= 0

  useEffect(() => {
    const listener = window.electronAPI.notificationAutoLlamasCheckLoading(
      async () => {
        setCheckLoading(false)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleAddAllAccounts = (accounts: Array<string>) => {
    const list = accounts.reduce(
      (accumulator, accountId) => {
        accumulator[accountId] = { accountId }

        return accumulator
      },
      {} as Parameters<typeof addAccounts>[0]
    )

    addAccounts(list)
    window.electronAPI.autoLlamasAccountAdd(list)
  }

  const handleRemoveAccount = (accountId: string) => () => {
    removeAccounts([accountId])
    window.electronAPI.autoLlamasAccountRemove([accountId])
  }
  const handleRemoveAllAccounts = () => {
    removeAccounts(null)
    window.electronAPI.autoLlamasAccountRemove(null)
  }

  const handleUpdateAccounts: typeof updateAccounts = (data) => {
    updateAccounts(data)
    window.electronAPI.autoLlamasAccountUpdate(data)
  }
  const handleEnableBuy = () => {
    updateAccounts(AutoLlamasBulkAction.EnableBuy)
    window.electronAPI.autoLlamasAccountUpdate(
      AutoLlamasBulkAction.EnableBuy
    )
  }
  const handleDisableBuy = () => {
    updateAccounts(AutoLlamasBulkAction.DisableBuy)
    window.electronAPI.autoLlamasAccountUpdate(
      AutoLlamasBulkAction.DisableBuy
    )
  }
  const handleCheck = () => {
    setCheckLoading(true)
    window.electronAPI.autoLlamasCheck()
  }

  const onSelectItem = (accountId: string) => {
    const accounts = { [accountId]: { accountId } }

    addAccounts(accounts)
    window.electronAPI.autoLlamasAccountAdd(accounts)
  }

  return {
    checkLoading,
    isAllEnabled,
    isDisableBuyButtonDisabled,
    selected,
    totalEnabledPurchases,

    handleAddAllAccounts,
    handleRemoveAccount,
    handleRemoveAllAccounts,
    handleUpdateAccounts,
    handleEnableBuy,
    handleDisableBuy,
    handleCheck,
    onSelectItem,
  }
}
