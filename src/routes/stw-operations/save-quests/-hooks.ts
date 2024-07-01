import type { SelectOption } from '../../../components/ui/third-party/extended/input-tags'

import { useEffect, useState } from 'react'

import { defaultColor } from '../../../config/constants/colors'

import {
  useGetSaveQuestsActions,
  useGetSaveQuestsData,
} from '../../../hooks/stw-operations/save-quests'
import { useGetAccounts } from '../../../hooks/accounts'
import { useGetGroups } from '../../../hooks/groups'
import { useGetTags } from '../../../hooks/tags'

import { toast } from '../../../lib/notifications'
import { parseDisplayName } from '../../../lib/utils'

export function useData() {
  const [isLoading, setIsLoading] = useState(false)
  const { accountsArray, accountList } = useGetAccounts()
  const { tagsArray } = useGetTags()
  const { groupsArray } = useGetGroups()
  const { selectedAccounts, selectedTags } = useGetSaveQuestsData()
  const { saveQuestsUpdateAccounts, saveQuestsUpdateTags } =
    useGetSaveQuestsActions()

  const areThereAccounts = accountsArray.length > 0
  const accounts: Array<SelectOption> = accountsArray.map((account) => {
    const label = parseDisplayName(account)

    return {
      label,
      color: defaultColor,
      value: account.accountId,
    }
  })
  const tags: Array<SelectOption> = tagsArray.map(([name, color]) => ({
    color: color ?? defaultColor,
    label: name,
    value: name,
  }))

  const parsedSelectedAccounts: Array<SelectOption> = selectedAccounts.map(
    (accountId) => {
      const selected = accounts.find((item) => item.value === accountId)!

      return {
        color: defaultColor,
        label: selected.label,
        value: selected.value,
      }
    }
  )
  const parsedSelectedTags: Array<SelectOption> = selectedTags.map(
    (tagName) => {
      const selected = tags.find((item) => item.value === tagName)!

      return {
        color: selected.color,
        label: selected.label,
        value: selected.value,
      }
    }
  )

  const isSelectedEmpty =
    parsedSelectedAccounts.length === 0 && parsedSelectedTags.length === 0

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

    const currentTags = parsedSelectedTags.map(({ value }) => value)
    const accountIds = [
      ...new Set([
        ...parsedSelectedAccounts.map(({ value }) => value),
        ...groupsArray
          .filter(([, itemTags]) =>
            currentTags.some((currentTag) => itemTags.includes(currentTag))
          )
          .map(([key]) => key),
      ]),
    ]
    const selectedAccounts = accountIds.map(
      (accountId) => accountList[accountId]
    )

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
