import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useAccountInfoStore } from '../../state/stw-operations/account-info'

export function useGetAccountInfoData() {
  const { accounts, tags } = useAccountInfoStore(
    useShallow((state) => ({
      accounts: state.accounts,
      tags: state.tags,
    }))
  )

  return {
    selectedAccounts: accounts,
    selectedTags: tags,
  }
}

export function useGetAccountInfoActions() {
  const { updateAccounts, updateTags } = useAccountInfoStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    }))
  )

  const rawAccountInfoUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const accountInfoUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawAccountInfoUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const accountInfoUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawAccountInfoUpdateAccounts,
    rawAccountInfoUpdateTags,
    accountInfoUpdateAccounts,
    accountInfoUpdateTags,
  }
}
