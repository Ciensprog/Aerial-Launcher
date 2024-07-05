import { useEffect, useState } from 'react'

import { useAccountSelectorData } from '../../../components/selectors/accounts/hooks'

import {
  useGetSaveQuestsActions,
  useGetSaveQuestsData,
} from '../../../hooks/stw-operations/save-quests'

import { toast } from '../../../lib/notifications'

export function useData() {
  const [isLoading, setIsLoading] = useState(false)
  const { selectedAccounts, selectedTags } = useGetSaveQuestsData()
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

  useEffect(() => {
    const listener = window.electronAPI.notificationClientQuestLogin(
      async () => {
        toast('Quests progression has been saved')
        setIsLoading(false)
      }
    )

    return () => {
      listener.removeListener()
    }
  }, [])

  const handleSave = () => {
    if (isSelectedEmpty || !areThereAccounts) {
      return
    }

    const selectedAccounts = getAccounts()

    if (selectedAccounts.length <= 0) {
      toast('No linked accounts')

      return
    }

    setIsLoading(true)
    window.electronAPI.setClientQuestLogin(selectedAccounts)
  }

  return {
    accounts,
    areThereAccounts,
    isLoading,
    isSelectedEmpty,
    parsedSelectedAccounts,
    parsedSelectedTags,
    tags,

    handleSave,
    saveQuestsUpdateAccounts,
    saveQuestsUpdateTags,
  }
}
