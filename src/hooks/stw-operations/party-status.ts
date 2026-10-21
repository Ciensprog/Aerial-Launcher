import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { usePartyStatusStore } from '../../state/stw-operations/party-status'

export function useGetPartyStatusData() {
  const { accounts, tags } = usePartyStatusStore(
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

export function useGetPartyStatusActions() {
  const { updateAccounts, updateTags } = usePartyStatusStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    }))
  )

  const rawPartyStatusUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const partyStatusUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawPartyStatusUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const partyStatusUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawPartyStatusUpdateAccounts,
    rawPartyStatusUpdateTags,
    partyStatusUpdateAccounts,
    partyStatusUpdateTags,
  }
}
