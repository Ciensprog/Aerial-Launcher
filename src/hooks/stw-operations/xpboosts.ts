import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useXPBoostsDataStore } from '../../state/stw-operations/xpboosts/accounts'
import {
  useXPBoostsFormConsumeStore,
  useXPBoostsFormStore,
} from '../../state/stw-operations/xpboosts/form'

import { useGetAccounts } from '../accounts'

import { parseCustomDisplayName } from '../../lib/utils'

export function useGetXPBoostsFormData() {
  const { amountToSend, updateAmountToSend } = useXPBoostsDataStore(
    useShallow((state) => ({
      amountToSend: state.amountToSend,
      updateAmountToSend: state.updateAmountToSend,
    }))
  )
  const { accounts, isSubmitting, tags } = useXPBoostsFormStore(
    useShallow((state) => ({
      accounts: state.accounts,
      isSubmitting: state.isSubmitting,
      tags: state.tags,
    }))
  )

  return {
    amountToSend,
    isSubmitting,

    updateAmountToSend,
    selectedAccounts: accounts,
    selectedTags: tags,
  }
}

export function useGetXPBoostsActions() {
  const { updateAccounts, updateIsSubmitting, updateTags } =
    useXPBoostsFormStore(
      useShallow((state) => ({
        updateAccounts: state.updateAccounts,
        updateIsSubmitting: state.updateIsSubmitting,
        updateTags: state.updateTags,
      }))
    )

  const rawXPBoostsUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const xpBoostsUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawXPBoostsUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const xpBoostsUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawXPBoostsUpdateAccounts,
    rawXPBoostsUpdateTags,
    xpBoostsUpdateAccounts,
    xpBoostsUpdateTags,
    updateIsSubmitting,
  }
}

export function useGetXPBoostsData() {
  const { accountList } = useGetAccounts()
  const { amountToSend, data, updateData } = useXPBoostsDataStore(
    useShallow((state) => ({
      amountToSend: state.amountToSend,
      data: state.data,
      updateData: state.updateData,
    }))
  )
  const amountToSendIsInvalid =
    Number.isNaN(Number(amountToSend)) || Number(amountToSend) === 0

  const newData = data
    .map((item) => {
      const currentAccount = accountList[item.accountId]

      if (currentAccount) {
        return {
          ...item,
          account: currentAccount,
        }
      }

      return item
    })
    .toSorted((itemA, itemB) =>
      parseCustomDisplayName(itemA.account).localeCompare(
        parseCustomDisplayName(itemB.account)
      )
    )

  return {
    amountToSend,
    amountToSendIsInvalid,
    data: newData,
    updateData,
  }
}

export function useGetXPBoostsFormGeneralStatus() {
  const isSubmitting = useXPBoostsFormStore((state) => state.isSubmitting)
  const { isSubmittingPersonal, isSubmittingTeammate } =
    useXPBoostsFormConsumeStore(
      useShallow((state) => ({
        isSubmittingPersonal: state.isSubmittingPersonal,
        isSubmittingTeammate: state.isSubmittingTeammate,
      }))
    )

  const generalIsSubmitting =
    isSubmitting || isSubmittingPersonal || isSubmittingTeammate

  return {
    generalIsSubmitting,
  }
}

export function useGetXPBoostsFormStatus() {
  const { isSubmitting, updateIsSubmitting } = useXPBoostsFormStore(
    useShallow((state) => ({
      isSubmitting: state.isSubmitting,
      updateIsSubmitting: state.updateIsSubmitting,
    }))
  )

  return {
    isSubmitting,

    updateIsSubmitting,
  }
}

export function useGetXPBoostsFormConsumeStatus() {
  const {
    isSubmittingPersonal,
    isSubmittingTeammate,
    updateIsSubmittingConsume,
  } = useXPBoostsFormConsumeStore(
    useShallow((state) => ({
      isSubmittingPersonal: state.isSubmittingPersonal,
      isSubmittingTeammate: state.isSubmittingTeammate,
      updateIsSubmittingConsume: state.updateIsSubmittingConsume,
    }))
  )

  return {
    isSubmittingPersonal,
    isSubmittingTeammate,

    updateIsSubmittingConsume,
  }
}
