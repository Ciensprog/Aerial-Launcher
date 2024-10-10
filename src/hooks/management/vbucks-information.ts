import { useShallow } from 'zustand/react/shallow'

import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import {
  useVBucksInformationStore,
  VBucksInformationState,
} from '../../state/management/vbucks-information'

export function useGetVBucksInformationData() {
  const { accounts, data, isLoading, tags } = useVBucksInformationStore(
    useShallow((state) => ({
      accounts: state.accounts,
      isLoading: state.isLoading,
      data: state.data,
      tags: state.tags,
    }))
  )

  return {
    isLoading,
    data,
    selectedAccounts: accounts,
    selectedTags: tags,
  }
}

export function useGetVBucksInformationActions() {
  const { updateAccounts, updateData, updateLoading, updateTags } =
    useVBucksInformationStore(
      useShallow((state) => ({
        updateAccounts: state.updateAccounts,
        updateData: state.updateData,
        updateLoading: state.updateLoading,
        updateTags: state.updateTags,
      }))
    )

  const rawVBucksInformationUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const vbucksInformationUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawVBucksInformationUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const vbucksInformationUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  const vbucksInformationUpdateData = (
    value: VBucksInformationState['data'],
    reset?: boolean
  ) => {
    updateData(value, reset)
  }

  const vbucksInformationUpdateLoading = (value: boolean) => {
    updateLoading(value)
  }

  return {
    rawVBucksInformationUpdateAccounts,
    rawVBucksInformationUpdateTags,
    vbucksInformationUpdateAccounts,
    vbucksInformationUpdateData,
    vbucksInformationUpdateLoading,
    vbucksInformationUpdateTags,
  }
}
