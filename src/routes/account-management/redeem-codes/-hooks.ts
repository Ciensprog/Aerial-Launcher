import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetRedeemCodesActions,
  useGetRedeemCodesData,
} from '../../../hooks/management/redeem-codes'

import { toast } from '../../../lib/notifications'

export function useRedeemCodesData() {
  const { isLoading, selectedAccounts, selectedTags } =
    useGetRedeemCodesData()
  const {
    redeemCodesUpdateAccounts,
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
  const isDisabledForm = isSelectedEmpty || isLoading || !areThereAccounts

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

  return {
    accounts,
    areThereAccounts,
    isDisabledForm,
    isLoading,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    selectedAccounts,
    selectedTags,
    tags,

    handleSave,
    redeemCodesUpdateAccounts,
    redeemCodesUpdateTags,
  }
}
