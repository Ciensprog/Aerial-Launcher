import type { ChangeEventHandler } from 'react'

import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetHomebaseNameActions,
  useGetHomebaseNameData,
} from '../../../hooks/stw-operations/homebase-name'

import { toast } from '../../../lib/notifications'

export function useHomebaseNameData() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [name, setName] = useState('')
  const { selectedAccounts, selectedTags } = useGetHomebaseNameData()
  const { homebaseNameUpdateAccounts, homebaseNameUpdateTags } =
    useGetHomebaseNameActions()
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
  const isDisabledForm =
    isSelectedEmpty ||
    isLoading ||
    !areThereAccounts ||
    name.trim().length === 0

  useEffect(() => {
    const listener = window.electronAPI.notificationHomebaseName(
      async (response) => {
        setIsLoading(false)
        setError(response.errorMessage)

        if (!response.errorMessage) {
          setName('')

          toast(t('homebase-name.notifications.updated'))
        }
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

    setIsLoading(true)

    window.electronAPI.setHomebaseName(selectedAccounts, name.trim())
  }
  const handleUpdateName: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setName(event.target.value ?? '')
  }

  return {
    accounts,
    areThereAccounts,
    error,
    isDisabledForm,
    isLoading,
    isSelectedEmpty,
    name,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    handleSave,
    handleUpdateName,
    homebaseNameUpdateAccounts,
    homebaseNameUpdateTags,
    setName,
  }
}
