import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useDailyQuestsStore } from '../../state/stw-operations/daily-quests'

export function useGetDailyQuestsData() {
  const { accounts, tags } = useDailyQuestsStore(
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

export function useGetDailyQuestsActions() {
  const { updateAccounts, updateTags } = useDailyQuestsStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    }))
  )

  const rawDailyQuestsUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const dailyQuestsUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawDailyQuestsUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const dailyQuestsUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawDailyQuestsUpdateAccounts,
    rawDailyQuestsUpdateTags,
    dailyQuestsUpdateAccounts,
    dailyQuestsUpdateTags,
  }
}
