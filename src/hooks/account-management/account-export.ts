import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useAccountExportStore } from '../../state/account-management/account-export'

export function useGetAccountExportData() {
  const { accounts, tags } = useAccountExportStore(
    useShallow((state) => ({
      accounts: state.accounts,
      tags: state.tags,
    })),
  )

  return {
    selectedAccounts: accounts,
    selectedTags: tags,
  }
}

export function useGetAccountExportActions() {
  const { updateAccounts, updateTags } = useAccountExportStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    })),
  )

  const rawAccountExportUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const accountExportUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawAccountExportUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const accountExportUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawAccountExportUpdateAccounts,
    rawAccountExportUpdateTags,
    accountExportUpdateAccounts,
    accountExportUpdateTags,
  }
}
