import type { ChangeEventHandler } from 'react'

import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  RedeemCodesCodeData,
  RedeemCodesStatus,
} from '../../../state/management/redeem-code'

import {
  useGetRedeemCodesActions,
  useGetRedeemCodesData,
} from '../../../hooks/management/redeem-codes'

import { parseRedeemCodes } from '../../../lib/parsers/texts'
import { toast } from '../../../lib/notifications'

export function useRedeemCodesData() {
  const { t } = useTranslation(['general'])

  const {
    codes,
    isLoading,
    notifications,
    selectedAccounts,
    selectedTags,
  } = useGetRedeemCodesData()
  const {
    redeemCodesClearResponse,
    redeemCodesSetInitialResponse,
    redeemCodesSetNotification,
    redeemCodesUpdateAccounts,
    redeemCodesUpdateCodes,
    redeemCodesUpdateLoading,
    redeemCodesUpdateTags,
  } = useGetRedeemCodesActions()
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

  const newNotifications = Object.values(notifications)
  const isDisabledForm =
    isSelectedEmpty ||
    isLoading ||
    !areThereAccounts ||
    codes.trim().length === 0

  useEffect(() => {
    const listener = window.electronAPI.redeemCodesNotification(
      async (notification) => {
        redeemCodesUpdateLoading(false)
        redeemCodesSetNotification(notification)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleRedeem = () => {
    if (isDisabledForm) {
      return
    }

    const selectedAccounts = getAccounts()

    if (selectedAccounts.length <= 0) {
      toast(t('form.accounts.no-linked'))

      return
    }

    const currentCodes = parseRedeemCodes(codes)
    const codeRecord = currentCodes.reduce(
      (accumulator, currentCode) => {
        accumulator[currentCode] = {
          status: RedeemCodesStatus.LOADING,
          value: currentCode,
        }

        return accumulator
      },
      {} as Record<string, RedeemCodesCodeData>
    )

    redeemCodesUpdateLoading(true)
    redeemCodesSetInitialResponse(selectedAccounts, codeRecord)

    window.electronAPI.redeemCodes(selectedAccounts, currentCodes)
  }
  const handleClearForm = () => {
    redeemCodesUpdateAccounts([])
    redeemCodesUpdateTags([])
    redeemCodesUpdateCodes('')
    redeemCodesClearResponse()
  }
  const handleUpdateCodes: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    redeemCodesUpdateCodes(event.target.value ?? '')
  }

  return {
    accounts,
    areThereAccounts,
    codes,
    isDisabledForm,
    isLoading,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    selectedAccounts,
    selectedTags,
    tags,
    notifications: newNotifications,

    handleClearForm,
    handleRedeem,
    handleUpdateCodes,
    redeemCodesUpdateAccounts,
    redeemCodesUpdateTags,
  }
}
