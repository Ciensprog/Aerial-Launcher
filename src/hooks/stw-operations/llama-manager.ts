import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useLlamaManagerStore } from '../../state/stw-operations/llama-manager'

export function useGetLlamaManagerData() {
  const accounts = useLlamaManagerStore((state) => state.accounts)
  const tags = useLlamaManagerStore((state) => state.tags)
  const isLoading = useLlamaManagerStore((state) => state.isLoading)
  const isActing = useLlamaManagerStore((state) => state.isActing)
  const data = useLlamaManagerStore((state) => state.data)
  const lastResult = useLlamaManagerStore((state) => state.lastResult)

  return {
    accounts,
    tags,
    isLoading,
    isActing,
    data,
    lastResult,
  }
}

export function useGetLlamaManagerActions() {
  const storeUpdateAccounts = useLlamaManagerStore(
    (state) => state.updateAccounts,
  )
  const storeUpdateTags = useLlamaManagerStore((state) => state.updateTags)
  const updateLoading = useLlamaManagerStore(
    (state) => state.updateLoading,
  )
  const updateActing = useLlamaManagerStore((state) => state.updateActing)
  const updateData = useLlamaManagerStore((state) => state.updateData)
  const clearData = useLlamaManagerStore((state) => state.clearData)
  const setLastResult = useLlamaManagerStore(
    (state) => state.setLastResult,
  )

  const updateAccounts = (value: Array<SelectOption>) => {
    storeUpdateAccounts(value.map((item) => item.value))
  }
  const updateTags = (value: Array<SelectOption>) => {
    storeUpdateTags(value.map((item) => item.value))
  }

  return {
    updateAccounts,
    updateTags,
    updateLoading,
    updateActing,
    updateData,
    clearData,
    setLastResult,
  }
}
