import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'
import type { AccountData } from '../../types/accounts'
import type { RedeemCodeAccountNotification } from '../../types/redeem-codes'

import { useShallow } from 'zustand/react/shallow'

import {
  RedeemCodesCodeData,
  RedeemCodesData,
  useRedeemCodesStore,
} from '../../state/management/redeem-code'

export function useGetRedeemCodesData() {
  const { accounts, codes, isLoading, notifications, tags } =
    useRedeemCodesStore(
      useShallow((state) => ({
        accounts: state.accounts,
        codes: state.codes,
        isLoading: state.isLoading,
        notifications: state.notifications,
        tags: state.tags,
      }))
    )

  return {
    codes,
    isLoading,
    notifications,
    selectedAccounts: accounts,
    selectedTags: tags,
  }
}

export function useGetRedeemCodesActions() {
  const {
    setInitialResponse,
    updateAccounts,
    updateCodes,
    updateLoading,
    updateResponse,
    updateTags,
  } = useRedeemCodesStore(
    useShallow((state) => ({
      setInitialResponse: state.setInitialResponse,
      updateAccounts: state.updateAccounts,
      updateCodes: state.updateCodes,
      updateLoading: state.updateLoading,
      updateResponse: state.updateResponse,
      updateTags: state.updateTags,
    }))
  )

  const rawRedeemCodesUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const redeemCodesUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawRedeemCodesUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const redeemCodesUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  const redeemCodesUpdateCodes = (value: string) => {
    updateCodes(value)
  }
  const redeemCodesUpdateLoading = (value: boolean) => {
    updateLoading(value)
  }

  const redeemCodesClearResponse = () => {
    setInitialResponse({})
  }
  const redeemCodesSetInitialResponse = (
    accounts: Array<AccountData>,
    codes: Record<string, RedeemCodesCodeData>
  ) => {
    setInitialResponse(
      accounts.reduce(
        (accumulator, current) => {
          accumulator[current.accountId] = {
            account: current,
            codes,
          }

          return accumulator
        },
        {} as Record<string, RedeemCodesData>
      )
    )
  }
  const redeemCodesSetNotification = (
    notification: RedeemCodeAccountNotification
  ) => {
    updateResponse(notification.accountId, {
      status: notification.status,
      value: notification.code,
    })
  }

  return {
    rawRedeemCodesUpdateAccounts,
    rawRedeemCodesUpdateTags,
    redeemCodesClearResponse,
    redeemCodesSetInitialResponse,
    redeemCodesSetNotification,
    redeemCodesUpdateAccounts,
    redeemCodesUpdateCodes,
    redeemCodesUpdateLoading,
    redeemCodesUpdateTags,
  }
}
