import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useStormShieldsStore } from '../../state/stw-operations/storm-shields'

export function useGetStormShieldsData() {
  const { accounts, tags } = useStormShieldsStore(
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

export function useGetStormShieldsActions() {
  const { updateAccounts, updateTags } = useStormShieldsStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    }))
  )

  const rawStormShieldsUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const stormShieldsUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawStormShieldsUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const stormShieldsUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawStormShieldsUpdateAccounts,
    rawStormShieldsUpdateTags,
    stormShieldsUpdateAccounts,
    stormShieldsUpdateTags,
  }
}
