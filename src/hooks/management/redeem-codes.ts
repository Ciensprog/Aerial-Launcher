import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useRedeemCodesStore } from '../../state/management/redeem-code'

export function useGetRedeemCodesData() {
  const { accounts, codes, isLoading, tags } = useRedeemCodesStore(
    useShallow((state) => ({
      accounts: state.accounts,
      codes: state.codes,
      isLoading: state.isLoading,
      tags: state.tags,
    }))
  )

  return {
    codes,
    isLoading,
    selectedAccounts: accounts,
    selectedTags: tags,
  }
}

export function useGetRedeemCodesActions() {
  const { updateAccounts, updateCodes, updateLoading, updateTags } =
    useRedeemCodesStore(
      useShallow((state) => ({
        updateAccounts: state.updateAccounts,
        updateCodes: state.updateCodes,
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

  const redeemCodesUpdateCodes = (value: string) => {
    updateCodes(value)
  }
  const redeemCodesUpdateLoading = (value: boolean) => {
    updateLoading(value)
  }

  return {
    rawRedeemCodesUpdateAccounts,
    rawRedeemCodesUpdateTags,
    redeemCodesUpdateAccounts,
    redeemCodesUpdateCodes,
    redeemCodesUpdateLoading,
    redeemCodesUpdateTags,
  }
}
