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
    (current) => current.actions['free-llamas']
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

  const onSelectItem = (accountId: string) => {
    const accounts = { [accountId]: { accountId } }

    addAccounts(accounts)
    window.electronAPI.autoLlamasAccountAdd(accounts)
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
