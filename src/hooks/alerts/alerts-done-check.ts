import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useAlertsDoneCheckStore } from '../../state/alerts/alerts-done-check'

export function useGetAlertsDoneCheckData() {
  const { accounts, tags } = useAlertsDoneCheckStore(
    useShallow((state) => ({
      accounts: state.accounts,
      tags: state.tags,
    })),
  )

  return {
    selectedAccounts: accounts,
    selectedTags: tags,
  }
}

export function useGetAlertsDoneCheckActions() {
  const { updateAccounts, updateTags } = useAlertsDoneCheckStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    })),
  )

  const rawAlertsDoneCheckUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const alertsDoneCheckUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawAlertsDoneCheckUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const alertsDoneCheckUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawAlertsDoneCheckUpdateAccounts,
    rawAlertsDoneCheckUpdateTags,
    alertsDoneCheckUpdateAccounts,
    alertsDoneCheckUpdateTags,
  }
}
