import type { TaxiServiceAccountDataList } from '../../types/taxi-service'

import { useShallow } from 'zustand/react/shallow'

import { AutomationStatusType } from '../../config/constants/automation'

import {
  useTaxiServiceNotificationsStore,
  useTaxiServiceStore,
} from '../../state/stw-operations/taxi-service'

import { useGetAccounts } from '../accounts'

export function useGetTaxiServiceData() {
  const { idsList } = useGetAccounts()
  const accounts = useTaxiServiceStore((state) => state.accounts)
  const selectedAccounts = idsList.reduce((accumulator, accountId) => {
    if (accounts[accountId]) {
      accumulator[accountId] = accounts[accountId]
    }

    return accumulator
  }, {} as TaxiServiceAccountDataList)

  return {
    selectedAccounts,
  }
}

export function useGetTaxiServiceDataStatus() {
  const accounts = useTaxiServiceStore((state) => state.accounts)
  const accountsArray = Object.values(accounts)
  const isIssue =
    accountsArray.length > 0
      ? accountsArray.some(
          (account) =>
            account.status === AutomationStatusType.DISCONNECTED ||
            account.status === AutomationStatusType.ERROR,
        )
      : null
  const isActive =
    accountsArray.length > 0
      ? accountsArray.some(
          (account) => account.status === AutomationStatusType.LISTENING,
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

export function useGetTaxiServiceActions() {
  const {
    addAccount,
    removeAccount,
    updateAccountAction,
    updateAccountStatus,
    updateAccountSubmitting,
  } = useTaxiServiceStore(
    useShallow((state) => ({
      removeAccount: state.removeAccount,
      addAccount: state.addOrUpdateAccount,
      updateAccountAction: state.updateAccountAction,
      updateAccountStatus: state.updateAccountStatus,
      updateAccountSubmitting: state.updateAccountSubmitting,
    })),
  )

  return {
    addAccount,
    removeAccount,
    updateAccountAction,
    updateAccountStatus,
    updateAccountSubmitting,
  }
}

export function useTaxiServiceNotifications() {
  const { data, clearData, updateData } = useTaxiServiceNotificationsStore(
    (state) => ({
      data: state.data,
      clearData: state.clearData,
      updateData: state.updateData,
    }),
  )

  return {
    data,

    clearData,
    updateData,
  }
}
