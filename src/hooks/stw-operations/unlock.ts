import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useUnlockStore } from '../../state/stw-operations/unlock'

export function useGetUnlockData() {
  const { accounts, tags } = useUnlockStore(
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

export function useGetUnlockActions() {
  const { updateAccounts, updateTags } = useUnlockStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    }))
  )

  const rawUnlockUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const unlockUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawUnlockUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const unlockUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawUnlockUpdateAccounts,
    rawUnlockUpdateTags,
    unlockUpdateAccounts,
    unlockUpdateTags,
  }
}
