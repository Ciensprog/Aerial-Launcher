// import type { ChangeEventHandler } from 'react'

import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetUnlockActions,
  useGetUnlockData,
} from '../../../hooks/stw-operations/unlock'
import { useUnlockStatusData } from '../../../hooks/management/unlock'
import { useGetAccounts } from '../../../hooks/accounts'

import { UnlockStatus } from '../../../state/accounts/unlock'

import { toast } from '../../../lib/notifications'

export function useUnlockData() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const { accountList } = useGetAccounts()
  const {
    data: currentStatuses,
    updateUnlockStatus,
    clearData,
  } = useUnlockStatusData()
  const { selectedAccounts, selectedTags } = useGetUnlockData()
  const { unlockUpdateAccounts, unlockUpdateTags } = useGetUnlockActions()
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
  const isDisabledForm = isSelectedEmpty || !areThereAccounts

  const data = Object.keys(currentStatuses)
    .filter((accountId) => accountList[accountId])
    .map((accountId) => accountList[accountId])

  useEffect(() => {
    const listener = window.electronAPI.notificationUnlock(
      async (accountId, status) => {
        updateUnlockStatus({
          [accountId]: {
            status,
          },
        })
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleSave = () => {
    if (isDisabledForm) {
      return
    }

    const selectedAccounts = getAccounts()

    if (selectedAccounts.length <= 0) {
      toast(
        t('form.accounts.no-linked', {
          ns: 'general',
        })
      )

      return
    }

    clearData()
    updateUnlockStatus(
      selectedAccounts.reduce(
        (accumulator, current) => {
          accumulator[current.accountId] = {
            status: null,
          }

          return accumulator
        },
        {} as Record<string, Partial<UnlockStatus>>
      )
    )

    window.electronAPI.setUnlock(selectedAccounts)
  }
  const clearFormData = () => {
    clearData()
  }

  return {
    accountList,
    accounts,
    areThereAccounts,
    data,
    currentStatuses,
    isDisabledForm,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    clearFormData,
    handleSave,
    unlockUpdateAccounts,
    unlockUpdateTags,
  }
}
