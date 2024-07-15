import type { ChangeEventHandler } from 'react'
import type { XPBoostsDataWithAccountData } from '../../../types/xpboosts'

import { useEffect, useState } from 'react'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetXPBoostsActions,
  useGetXPBoostsData,
  useGetXPBoostsFormConsumeStatus,
  useGetXPBoostsFormData,
  useGetXPBoostsFormStatus,
} from '../../../hooks/stw-operations/xpboosts'
import { useGetAccounts } from '../../../hooks/accounts'

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
    updateAmountToSend(event.target.value.replace(/[^0-9]+/g, ''))
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

export function useAccountDataItem({
  data,
}: {
  data: XPBoostsDataWithAccountData
}) {
  const isZero =
    data.items.personal.quantity === 0 &&
    data.items.teammate.quantity === 0
  const isDisabled = isZero

  return {
    isDisabled,
    isZero,
  }
}

export function useSendBoostsSheet() {
  const [xpBoostType, setXPBoostType] = useState(false)
  const [accountIdSelected, setAccountIdSelected] = useState<
    string | null
  >(null)

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
    (item) => item.items.personal.quantity > 0
  )
  const dataFilterByTeammateType = data.filter(
    (item) => item.items.teammate.quantity > 0
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
      total: Number(amountToSend),
    })
  }

  return {
    accountIdSelected,
    amountToSendIsInvalid,
    amountToSendParsedToNumber,
    consumePersonalBoostsButtonIsDisabled,
    consumeTeammateBoostsButtonIsDisabled,
    data,
    dataFilterByPersonalType,
    dataFilterByTeammateType,
    generalIsSubmitting,
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
