import type { AutomationAccountDataList } from '../../types/automation'

import { useShallow } from 'zustand/react/shallow'

import { AutomationStatusType } from '../../config/constants/automation'

import { useAutomationStore } from '../../state/stw-operations/automation'

import { useGetAccounts } from '../accounts'

export function useGetAutomationData() {
  const { idsList } = useGetAccounts()
  const accounts = useAutomationStore((state) => state.accounts)
  const selectedAccounts = idsList.reduce((accumulator, accountId) => {
    if (accounts[accountId]) {
      accumulator[accountId] = accounts[accountId]
    }

    return accumulator
  }, {} as AutomationAccountDataList)

  return {
    selectedAccounts,
  }
}

export function useGetAutomationDataStatus() {
  const accounts = useAutomationStore((state) => state.accounts)
  const accountsArray = Object.values(accounts)
  const isIssue =
    accountsArray.length > 0
      ? accountsArray.some(
          (account) =>
            account.status === AutomationStatusType.DISCONNECTED ||
            account.status === AutomationStatusType.ERROR
        )
      : null
  const isActive =
    accountsArray.length > 0
      ? accountsArray.some(
          (account) => account.status === AutomationStatusType.LISTENING
        )
      : null

  const status =
    accountsArray.length > 0
      ? isIssue
        ? AutomationStatusType.ISSUE
        : isActive
          ? AutomationStatusType.LISTENING
          : null
      : null

  return {
    status,
  }
}

export function useGetAutomationActions() {
  const {
    addAccount,
    removeAccount,
    updateAccountAction,
    updateAccountStatus,
    updateAccountSubmitting,
  } = useAutomationStore(
    useShallow((state) => ({
      removeAccount: state.removeAccount,
      addAccount: state.addOrUpdateAccount,
      updateAccountAction: state.updateAccountAction,
      updateAccountStatus: state.updateAccountStatus,
      updateAccountSubmitting: state.updateAccountSubmitting,
    }))
  )

  return {
    addAccount,
    removeAccount,
    updateAccountAction,
    updateAccountStatus,
    updateAccountSubmitting,
  }
}
