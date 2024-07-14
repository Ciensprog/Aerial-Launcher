import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useXPBoostsStore } from '../../state/stw-operations/xpboosts'

export function useGetXPBoostsData() {
  const { accounts, tags } = useXPBoostsStore(
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

export function useGetXPBoostsActions() {
  const { updateAccounts, updateTags } = useXPBoostsStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    }))
  )

  const rawXPBoostsUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const xpBoostsUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawXPBoostsUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const xpBoostsUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawXPBoostsUpdateAccounts,
    rawXPBoostsUpdateTags,
    xpBoostsUpdateAccounts,
    xpBoostsUpdateTags,
  }
}
