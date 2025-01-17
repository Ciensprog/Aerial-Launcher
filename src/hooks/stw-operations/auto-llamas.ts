import {
  AutoLlamasBulkAction,
  useAutoLlamaStore,
} from '../../state/stw-operations/auto/llamas'

export function useAutoLlamaData() {
  const { selected, addAccounts, removeAccounts, updateAccounts } =
    useAutoLlamaStore((state) => ({
      selected: state.accounts,
      addAccounts: state.addAccounts,
      removeAccounts: state.removeAccounts,
      updateAccounts: state.updateAccounts,
    }))

  const totalEnabled = Object.values(selected).filter(
    (current) => current.actions.survivors
  ).length
  const isAllEnabled = totalEnabled >= Object.keys(selected).length
  const isDisableBuyButtonDisabled = totalEnabled <= 0

  const handleAddAllAccounts = (accounts: Array<string>) => {
    const list = accounts.reduce(
      (accumulator, accountId) => {
        accumulator[accountId] = { accountId }

        return accumulator
      },
      {} as Parameters<typeof addAccounts>[0]
    )

    addAccounts(list)
    // window.electronAPI.()
  }

  const handleRemoveAccount = (accountId: string) => () => {
    removeAccounts([accountId])
    // window.electronAPI.()
  }
  const handleRemoveAllAccounts = () => {
    removeAccounts(null)
    // window.electronAPI.()
  }

  const handleUpdateAccounts: typeof updateAccounts = (data) => {
    updateAccounts(data)
    // window.electronAPI.()
  }
  const handleEnableBuy = () => {
    updateAccounts(AutoLlamasBulkAction.EnableBuy)
    // window.electronAPI.()
  }
  const handleDisableBuy = () => {
    updateAccounts(AutoLlamasBulkAction.DisableBuy)
    // window.electronAPI.()
  }

  const onSelectItem = (accountId: string) => {
    addAccounts({ [accountId]: { accountId } })
    // window.electronAPI.()
  }

  return {
    isAllEnabled,
    isDisableBuyButtonDisabled,
    selected,

    handleAddAllAccounts,
    handleRemoveAccount,
    handleRemoveAllAccounts,
    handleUpdateAccounts,
    handleEnableBuy,
    handleDisableBuy,
    onSelectItem,
  }
}
