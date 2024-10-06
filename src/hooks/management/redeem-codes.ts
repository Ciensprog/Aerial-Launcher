import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useRedeemCodesStore } from '../../state/management/redeem-code'

export function useGetRedeemCodesData() {
  const { accounts, isLoading, tags } = useRedeemCodesStore(
    useShallow((state) => ({
      accounts: state.accounts,
      isLoading: state.isLoading,
      tags: state.tags,
    }))
  )

  return {
    isLoading,
    selectedAccounts: accounts,
    selectedTags: tags,
  }
}

export function useGetRedeemCodesActions() {
  const { updateAccounts, updateLoading, updateTags } =
    useRedeemCodesStore(
      useShallow((state) => ({
        updateAccounts: state.updateAccounts,
        updateLoading: state.updateLoading,
        updateTags: state.updateTags,
      }))
    )

  const rawRedeemCodesUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const redeemCodesUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawRedeemCodesUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const redeemCodesUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  const redeemCodesUpdateLoading = (value: boolean) => {
    updateLoading(value)
  }

  return {
    rawRedeemCodesUpdateAccounts,
    rawRedeemCodesUpdateTags,
    redeemCodesUpdateAccounts,
    redeemCodesUpdateLoading,
    redeemCodesUpdateTags,
  }
}
