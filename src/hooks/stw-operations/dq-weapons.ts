import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useDqWeaponsStore } from '../../state/stw-operations/dq-weapons'

export function useGetDqWeaponsData() {
  const { accounts, tags } = useDqWeaponsStore(
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

export function useGetDqWeaponsActions() {
  const { updateAccounts, updateTags } = useDqWeaponsStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    }))
  )

  const rawDqWeaponsUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const dqWeaponsUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawDqWeaponsUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const dqWeaponsUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawDqWeaponsUpdateAccounts,
    rawDqWeaponsUpdateTags,
    dqWeaponsUpdateAccounts,
    dqWeaponsUpdateTags,
  }
}
