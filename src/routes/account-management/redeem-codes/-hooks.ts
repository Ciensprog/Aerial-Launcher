import type { ChangeEventHandler } from 'react'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetRedeemCodesActions,
  useGetRedeemCodesData,
} from '../../../hooks/management/redeem-codes'

import { toast } from '../../../lib/notifications'

export function useRedeemCodesData() {
  const { codes, isLoading, selectedAccounts, selectedTags } =
    useGetRedeemCodesData()
  const {
    redeemCodesUpdateAccounts,
    redeemCodesUpdateCodes,
    redeemCodesUpdateLoading,
    redeemCodesUpdateTags,
  } = useGetRedeemCodesActions()
  const {
    accounts,
    areThereAccounts,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    getAccounts,
  } = useAccountSelectorData({
    selectedAccounts,
    selectedTags,
  })
  const isDisabledForm =
    isSelectedEmpty ||
    isLoading ||
    !areThereAccounts ||
    codes.trim().length === 0

  const handleSave = () => {
    if (isDisabledForm) {
      return
    }

    const selectedAccounts = getAccounts()

    if (selectedAccounts.length <= 0) {
      toast('No linked accounts')

      return
    }

    redeemCodesUpdateLoading(true)
  }
  const handleUpdateCodes: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    redeemCodesUpdateCodes(event.target.value ?? '')
  }

  return {
    accounts,
    areThereAccounts,
    codes,
    isDisabledForm,
    isLoading,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    selectedAccounts,
    selectedTags,
    tags,

    handleSave,
    handleUpdateCodes,
    redeemCodesUpdateAccounts,
    redeemCodesUpdateTags,
  }
}
