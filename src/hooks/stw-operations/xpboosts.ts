import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import {
  useXPBoostsFormConsumeStore,
  useXPBoostsFormStore,
} from '../../state/stw-operations/xpboosts/forms/consume-personal'
import { useXPBoostsConsumeTeammateFormStore } from '../../state/stw-operations/xpboosts/forms/consume-teammate'
import { useXPBoostsDataStore } from '../../state/stw-operations/xpboosts/accounts'

import { useGetAccounts } from '../accounts'

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
  const { accountList, idsList } = useGetAccounts()
  const { amountToSend, data, updateData } = useXPBoostsDataStore(
    useShallow((state) => ({
      amountToSend: state.amountToSend,
      data: state.data,
      updateData: state.updateData,
    }))
  )
  const amountToSendIsInvalid =
    Number.isNaN(Number(amountToSend)) || Number(amountToSend) === 0

  const newData = idsList
    .map((accountId) => {
      const result = data.find(
        (current) => current.accountId === accountId
      )

      if (result) {
        const currentAccount = accountList[result.accountId]

        if (currentAccount) {
          return {
            ...result,
            account: currentAccount,
          }
        }
      }

      return null
    })
    .filter((item) => item !== null)

  return {
    amountToSend,
    amountToSendIsInvalid,
    data: newData,
    updateData,
  }
}

export function useXPBoostsAccountItem() {
  const updateAvailability = useXPBoostsDataStore(
    (state) => state.updateAvailability
  )

  return {
    updateAvailability,
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

export function useGetXPBoostsConsumeTeammateFormStatus() {
  const { isSubmitting, updateIsSubmitting } =
    useXPBoostsConsumeTeammateFormStore(
      useShallow((state) => ({
        isSubmitting: state.isSubmitting,
        updateIsSubmitting: state.updateIsSubmitting,
      }))
    )

  return {
    searchUserIsSubmitting: isSubmitting,

    updateSearchUserIsSubmitting: updateIsSubmitting,
  }
}
