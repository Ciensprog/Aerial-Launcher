import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useShallow } from 'zustand/react/shallow'

import { useCloudStorageStore } from '../../state/stw-operations/cloud-storage'

export function useGetCloudStorageData() {
  const { accounts, tags } = useCloudStorageStore(
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

export function useGetCloudStorageActions() {
  const { updateAccounts, updateTags } = useCloudStorageStore(
    useShallow((state) => ({
      updateAccounts: state.updateAccounts,
      updateTags: state.updateTags,
    })),
  )

  const rawCloudStorageUpdateAccounts = (value: Array<string>) => {
    updateAccounts(value)
  }
  const cloudStorageUpdateAccounts = (value: Array<SelectOption>) => {
    updateAccounts(value.map((item) => item.value))
  }

  const rawCloudStorageUpdateTags = (value: Array<string>) => {
    updateTags(value)
  }
  const cloudStorageUpdateTags = (value: Array<SelectOption>) => {
    updateTags(value.map((item) => item.value))
  }

  return {
    rawCloudStorageUpdateAccounts,
    rawCloudStorageUpdateTags,
    cloudStorageUpdateAccounts,
    cloudStorageUpdateTags,
  }
}
