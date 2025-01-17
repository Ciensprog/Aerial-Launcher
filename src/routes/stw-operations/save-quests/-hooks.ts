import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetSaveQuestsActions,
  useGetSaveQuestsData,
} from '../../../hooks/stw-operations/save-quests'
import { useGetAccounts } from '../../../hooks/accounts'

import { toast } from '../../../lib/notifications'

export function useData() {
  const { t } = useTranslation(['stw-operations', 'general'])

  const [isLoading, setIsLoading] = useState(false)
  const [isLeavePartyLoading, setIsLeavePartyLoading] = useState(false)

  const { accountsArray } = useGetAccounts()
  const { claimState, selectedAccounts, selectedTags, changeClaimState } =
    useGetSaveQuestsData()
  const { saveQuestsUpdateAccounts, saveQuestsUpdateTags } =
    useGetSaveQuestsActions()
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

  const saveQuestsButtonIsDisabled =
    isSelectedEmpty || isLoading || !areThereAccounts
  const leavePartyButtonIsDisabled =
    isSelectedEmpty || isLeavePartyLoading || !areThereAccounts

  useEffect(() => {
    const listener = window.electronAPI.notificationClientQuestLogin(
      async () => {
        setIsLoading(false)

        toast(t('save-quests.notifications.saved'))
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  useEffect(() => {
    const listener = window.electronAPI.notificationLeave(
      async (total) => {
        setIsLeavePartyLoading(false)

        toast(
          total === 0
            ? 'No user has been kicked'
            : `Kicked ${total} user${total > 1 ? 's' : ''}`
        )
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleSave = () => {
    if (saveQuestsButtonIsDisabled) {
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

    window.electronAPI.setClientQuestLogin(selectedAccounts)
  }

  const handleLeaveParty = () => {
    if (leavePartyButtonIsDisabled) {
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

    setIsLeavePartyLoading(true)

    window.electronAPI.leaveParty(
      selectedAccounts,
      accountsArray,
      claimState
    )
  }

  return {
    accounts,
    claimState,
    isLeavePartyLoading,
    isLoading,
    leavePartyButtonIsDisabled,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,
    saveQuestsButtonIsDisabled,

    changeClaimState,
    handleLeaveParty,
    handleSave,
    saveQuestsUpdateAccounts,
    saveQuestsUpdateTags,
  }
}
