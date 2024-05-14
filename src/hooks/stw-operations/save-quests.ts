import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useSaveQuestsStore } from '../../state/stw-operations/save-quests'

export function useGetSaveQuestsData() {
  const { accounts, tags } = useSaveQuestsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      tags: state.tags,
    }))
  )

  return {
    selectedAccounts: accounts,
    selectedTags: tags,
  }
}

export function useGetSaveQuestsActions() {
  const { updateAccounts, updateTags } = useSaveQuestsStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    }))
  )

  const rawSaveQuestsUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const saveQuestsUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawSaveQuestsUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const saveQuestsUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawSaveQuestsUpdateAccounts,
    rawSaveQuestsUpdateTags,
    saveQuestsUpdateAccounts,
    saveQuestsUpdateTags,
  }
}
