import { useState } from 'react'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetXPBoostsActions,
  useGetXPBoostsData,
} from '../../../hooks/stw-operations/xpboosts'

import { toast } from '../../../lib/notifications'

export function useData() {
  const [isLoading, setIsLoading] = useState(false)
  const { selectedAccounts, selectedTags } = useGetXPBoostsData()
  const { xpBoostsUpdateAccounts, xpBoostsUpdateTags } =
    useGetXPBoostsActions()
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

  const handleSearch = () => {
    if (isSelectedEmpty || !areThereAccounts) {
      return
    }

    const selectedAccounts = getAccounts()

    if (selectedAccounts.length <= 0) {
      toast('No linked accounts')

      return
    }

    console.log('selectedAccounts ->', selectedAccounts)

    // setIsLoading(true)
    // window.electronAPI.(selectedAccounts)
  }

  return {
    accounts,
    areThereAccounts,
    isLoading,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    handleSearch,
    xpBoostsUpdateAccounts,
    xpBoostsUpdateTags,
  }
}
