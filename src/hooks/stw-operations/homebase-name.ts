import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useHomebaseNameStore } from '../../state/stw-operations/homebase-name'

export function useGetHomebaseNameData() {
  const { accounts, tags } = useHomebaseNameStore(
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

export function useGetHomebaseNameActions() {
  const { updateAccounts, updateTags } = useHomebaseNameStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    }))
  )

  const rawHomebaseNameUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const homebaseNameUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawHomebaseNameUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const homebaseNameUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawHomebaseNameUpdateAccounts,
    rawHomebaseNameUpdateTags,
    homebaseNameUpdateAccounts,
    homebaseNameUpdateTags,
  }
}
