import type { ChangeEventHandler } from 'react'
import type { XPBoostsDataWithAccountData } from '../../../types/xpboosts'

import { useEffect, useState } from 'react'

import { maxAmountLimitedTo } from '../../../config/constants/xpboosts'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetXPBoostsActions,
  useGetXPBoostsData,
  useGetXPBoostsFormConsumeStatus,
  useGetXPBoostsFormData,
  useGetXPBoostsFormStatus,
  useXPBoostsAccountItem,
} from '../../../hooks/stw-operations/xpboosts'
import {
  useGetAccounts,
  useGetSelectedAccount,
} from '../../../hooks/accounts'

import { calculateTeammateXPBoostsToUse } from '../../../lib/calculations/xpboosts'
import { compactNumber } from '../../../lib/parsers/numbers'
import { toast } from '../../../lib/notifications'

export function useData() {
  const { accountList } = useGetAccounts()
  const {
    amountToSend,
    selectedAccounts,
    selectedTags,
    updateAmountToSend,
  } = useGetXPBoostsFormData()
  const { isSubmitting, updateIsSubmitting } = useGetXPBoostsFormStatus()
  const {
    isSubmittingPersonal,
    isSubmittingTeammate,
    updateIsSubmittingConsume,
  } = useGetXPBoostsFormConsumeStatus()
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
  const { amountToSendIsInvalid, data, updateData } = useGetXPBoostsData()

  const amountToSendParsedToNumber = amountToSendIsInvalid
    ? 0
    : Number(amountToSend)

  const seeBoostsButtonIsDisabled =
    isSelectedEmpty ||
    isSubmitting ||
    isSubmittingPersonal ||
    isSubmittingTeammate ||
    !areThereAccounts ||
    amountToSendIsInvalid
  const actionFormIsDisabled =
    isSubmitting || isSubmittingPersonal || isSubmittingTeammate

  const summary = data.reduce(
    (accumulator, current) => {
      accumulator['teammate'] += current.items.teammate.quantity
      accumulator['personal'] += current.items.personal.quantity

      return accumulator
    },
    {
      teammate: 0,
      personal: 0,
    }
  )

  useEffect(() => {
    const listener = window.electronAPI.notificationXPBoostsAccounts(
      async (data) => {
        updateIsSubmitting(false)
        updateData(
          data.map((item) => ({
            ...item,
            account: accountList[item.accountId],
          }))
        )
        updateAmountToSend(amountToSend)
        updateIsSubmittingConsume('personal', false)
        updateIsSubmittingConsume('teammate', false)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [accountList, amountToSend])

  useEffect(() => {
    const listener =
      window.electronAPI.notificationConsumePersonalXPBoosts(
        async ({ total }) => {
          const currentTotalXPBoosts = compactNumber(
            total.xpBoosts.current
          )
          const expectedTotalXPBoosts = compactNumber(
            total.xpBoosts.expected
          )

          toast(
            `A total of ${currentTotalXPBoosts}/${expectedTotalXPBoosts} XP boost${total.xpBoosts.current > 1 ? 's were' : ' was'} consumed. Summary of ${compactNumber(total.accounts)} account${total.accounts > 1 ? 's' : ''}`
          )
        }
      )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleChangeAmount: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const value = event.target.value.replace(/[^0-9]+/g, '')
    const currentValue = Number.isNaN(value) ? 0 : Number(value)

    updateAmountToSend(
      currentValue > maxAmountLimitedTo
        ? `${maxAmountLimitedTo}`
        : `${currentValue === 0 ? '' : currentValue}`
    )
  }

  const handleSearch = () => {
    if (isSelectedEmpty || !areThereAccounts) {
      return
    }

    const parsedAccounts = getAccounts()

    if (parsedAccounts.length <= 0) {
      toast('No linked accounts')

      return
    }

    updateIsSubmitting(true)
    window.electronAPI.requestXPBoostsAccounts(parsedAccounts)
  }

  return {
    actionFormIsDisabled,
    accounts,
    amountToSend,
    amountToSendParsedToNumber,
    data,
    isSubmitting,
    parsedSelectedAccounts,
    parsedSelectedTags,
    seeBoostsButtonIsDisabled,
    summary,
    tags,

    getAccounts,
    handleChangeAmount,
    handleSearch,
    xpBoostsUpdateAccounts,
    xpBoostsUpdateTags,
  }
}

export function useFilterXPBoosts({
  amountToSend,
  data,
}: {
  amountToSend: number
  data: Array<XPBoostsDataWithAccountData>
}) {
  const result = calculateTeammateXPBoostsToUse({
    amountToSend,
    data,
  })
  const calculatedTotal = Object.values(result).reduce(
    (accumulator, current) => accumulator + current,
    0
  )

  return {
    calculatedTotal,
    teammateXPBoostsFiltered: result,
  }
}

export function useAccountDataItem({
  data,
}: {
  data: XPBoostsDataWithAccountData
}) {
  const { amountToSend, amountToSendIsInvalid } = useGetXPBoostsData()
  const { updateAvailability } = useXPBoostsAccountItem()

  const amountToSendParsedToNumber = amountToSendIsInvalid
    ? 0
    : Number(amountToSend)

  const isZero =
    data.items.personal.quantity === 0 &&
    data.items.teammate.quantity === 0
  const isDisabled = !data.available || isZero

  const handleChangeAvailability = (value: boolean) => {
    if (isZero) {
      return
    }

    updateAvailability(data.accountId, !value)
  }

  return {
    amountToSendParsedToNumber,
    isDisabled,
    isZero,

    handleChangeAvailability,
  }
}

export function useSendBoostsSheet() {
  const { selected: currentAccountSelected } = useGetSelectedAccount()
  const { accountList } = useGetAccounts()

  const [xpBoostType, setXPBoostType] = useState(false)
  const [accountIdSelected, setAccountIdSelected] = useState<
    string | null
  >(currentAccountSelected?.accountId ?? null)

  const { selectedAccounts, selectedTags } = useGetXPBoostsFormData()
  const { getAccounts } = useAccountSelectorData({
    selectedAccounts,
    selectedTags,
  })

  const { isSubmitting } = useGetXPBoostsFormStatus()
  const {
    isSubmittingPersonal,
    isSubmittingTeammate,
    updateIsSubmittingConsume,
  } = useGetXPBoostsFormConsumeStatus()
  const { amountToSend, amountToSendIsInvalid, data } =
    useGetXPBoostsData()

  const amountToSendParsedToNumber = amountToSendIsInvalid
    ? 0
    : Number(amountToSend)
  const dataFilterByPersonalType = data.filter(
    (item) => item.available && item.items.personal.quantity > 0
  )
  const dataFilterByTeammateType = data.filter(
    (item) => item.available && item.items.teammate.quantity > 0
  )

  const noPersonalBoostsData = dataFilterByPersonalType.length <= 0
  const noTeammateBoostsData = dataFilterByTeammateType.length <= 0
  const sendBoostsButtonIsDisabled = isSubmitting
  const generalIsSubmitting =
    isSubmitting || isSubmittingPersonal || isSubmittingTeammate
  const consumePersonalBoostsButtonIsDisabled =
    amountToSendIsInvalid || generalIsSubmitting || noPersonalBoostsData
  const consumeTeammateBoostsButtonIsDisabled =
    !accountIdSelected ||
    amountToSendIsInvalid ||
    generalIsSubmitting ||
    noTeammateBoostsData
  const inputSearchIsDisabled =
    amountToSendIsInvalid || generalIsSubmitting || noTeammateBoostsData

  useEffect(() => {
    console.log('----------')
    console.log('Use:', currentAccountSelected)

    if (
      currentAccountSelected?.accountId &&
      currentAccountSelected.accountId !== accountIdSelected
    ) {
      console.log('Update:', currentAccountSelected)
      setAccountIdSelected(currentAccountSelected.accountId)
    }

    // return () => {
    //   //
    // }
  }, [currentAccountSelected])

  const handleSetXPBoostsType = (value: boolean) => {
    if (generalIsSubmitting) {
      return
    }

    setXPBoostType(value)
  }
  const handleSetAccountIdSelected = (value: string | null) => {
    if (
      amountToSendIsInvalid ||
      generalIsSubmitting ||
      noTeammateBoostsData
    ) {
      return
    }

    setAccountIdSelected(value)
  }
  const handleConsumePersonal = () => {
    if (consumePersonalBoostsButtonIsDisabled) {
      return
    }

    updateIsSubmittingConsume('personal', true)

    window.electronAPI.consumePersonalXPBoosts({
      accounts: dataFilterByPersonalType,
      originalAccounts: getAccounts(),
      total: amountToSendParsedToNumber,
    })
  }

  return {
    accountIdSelected,
    accountList,
    amountToSendIsInvalid,
    amountToSendParsedToNumber,
    consumePersonalBoostsButtonIsDisabled,
    consumeTeammateBoostsButtonIsDisabled,
    currentAccountSelected,
    data,
    dataFilterByPersonalType,
    dataFilterByTeammateType,
    generalIsSubmitting,
    inputSearchIsDisabled,
    isSubmittingPersonal,
    isSubmittingTeammate,
    noPersonalBoostsData,
    noTeammateBoostsData,
    sendBoostsButtonIsDisabled,
    xpBoostType,

    handleConsumePersonal,
    handleSetAccountIdSelected,
    handleSetXPBoostsType,
  }
}
