import { useEffect } from 'react'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import { VBucksInformationData } from '../../../state/management/vbucks-information'

import {
  useGetVBucksInformationActions,
  useGetVBucksInformationData,
} from '../../../hooks/management/vbucks-information'
import { useGetAccounts } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'

export function useVBucksInformationData() {
  const { accountsArray } = useGetAccounts()
  const { data, isLoading, selectedAccounts, selectedTags } =
    useGetVBucksInformationData()
  const {
    vbucksInformationUpdateAccounts,
    vbucksInformationUpdateData,
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

  const parsedData = accountsArray
    .filter((account) => data[account.accountId] !== undefined)
    .map((account) => data[account.accountId])
  const vbucksSummary = parsedData.reduce((accumulator, current) => {
    const total = Object.values(current.currency).reduce(
      (currencyAccumulator, currencyCurrent) => {
        currencyAccumulator += currencyCurrent.quantity ?? 0

        return currencyAccumulator
      },
      0
    )

    accumulator += total ?? 0

    return accumulator
  }, 0)

  const isDisabledForm = isSelectedEmpty || isLoading || !areThereAccounts

  useEffect(() => {
    const listener = window.electronAPI.getVBucksInformationNotification(
      async (data) => {
        vbucksInformationUpdateLoading(false)
        vbucksInformationUpdateData(data)
      }
    )

    return () => {
      listener.removeListener()
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
    vbucksInformationUpdateData({}, true)

    window.electronAPI.getVBucksInformation(selectedAccounts)
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
    vbucksSummary,
    data: parsedData,

    handleGetInfo,
    vbucksInformationUpdateAccounts,
    vbucksInformationUpdateTags,
  }
}

export function useParseAccountInfo({
  data,
}: {
  data: VBucksInformationData
}) {
  const { accountList } = useGetAccounts()

  const account = accountList[data.accountId]
  const total = Object.values(data.currency).reduce(
    (currencyAccumulator, currencyCurrent) => {
      currencyAccumulator += currencyCurrent.quantity ?? 0

      return currencyAccumulator
    },
    0
  )

  const details = Object.entries(data.currency)

  return {
    account,
    details,
    total,
  }
}
