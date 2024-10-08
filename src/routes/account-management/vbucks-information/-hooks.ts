import { useEffect } from 'react'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetVBucksInformationActions,
  useGetVBucksInformationData,
} from '../../../hooks/management/vbucks-information'

import { toast } from '../../../lib/notifications'

export function useVBucksInformationData() {
  const { data, isLoading, selectedAccounts, selectedTags } =
    useGetVBucksInformationData()
  const {
    vbucksInformationUpdateAccounts,
    vbucksInformationUpdateLoading,
    vbucksInformationUpdateTags,
  } = useGetVBucksInformationActions()
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

  useEffect(() => {
    // const listener = window.electronAPI.redeemCodesNotification(
    //   async (notification) => {
    //     vbucksInformationUpdateLoading(false)
    //     redeemCodesSetNotification(notification)
    //   }
    // )

    return () => {
      // listener.removeListener()
    }
  }, [])

  const handleGetInfo = () => {
    if (isDisabledForm) {
      return
    }

    const selectedAccounts = getAccounts()

    if (selectedAccounts.length <= 0) {
      toast('No linked accounts')

      return
    }

    vbucksInformationUpdateLoading(true)

    // window.electronAPI.redeemCodes(selectedAccounts, currentCodes)
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

    handleGetInfo,
    vbucksInformationUpdateAccounts,
    vbucksInformationUpdateTags,
  }
}
