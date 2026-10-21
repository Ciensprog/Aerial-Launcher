import type { SelectOption } from '../../components/ui/third-party/extended/input-tags'

import { useCollectionBookStore } from '../../state/stw-operations/collection-book'

export function useGetCollectionBookData() {
  const accounts = useCollectionBookStore((state) => state.accounts)
  const tags = useCollectionBookStore((state) => state.tags)
  const isLoading = useCollectionBookStore((state) => state.isLoading)
  const isActing = useCollectionBookStore((state) => state.isActing)
  const data = useCollectionBookStore((state) => state.data)
  const lastResult = useCollectionBookStore((state) => state.lastResult)
  const targetLevel = useCollectionBookStore((state) => state.targetLevel)

  return {
    accounts,
    tags,
    isLoading,
    isActing,
    data,
    lastResult,
    targetLevel,
  }
}

export function useGetCollectionBookActions() {
  const storeUpdateAccounts = useCollectionBookStore(
    (state) => state.updateAccounts,
  )
  const storeUpdateTags = useCollectionBookStore(
    (state) => state.updateTags,
  )
  const updateLoading = useCollectionBookStore(
    (state) => state.updateLoading,
  )
  const updateActing = useCollectionBookStore(
    (state) => state.updateActing,
  )
  const updateData = useCollectionBookStore((state) => state.updateData)
  const clearData = useCollectionBookStore((state) => state.clearData)
  const setLastResult = useCollectionBookStore(
    (state) => state.setLastResult,
  )
  const setTargetLevel = useCollectionBookStore(
    (state) => state.setTargetLevel,
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
    setTargetLevel,
  }
}
