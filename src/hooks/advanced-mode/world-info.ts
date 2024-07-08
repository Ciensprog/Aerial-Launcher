import { useShallow } from 'zustand/react/shallow'

import { useCurrentWorldInfoStore } from '../../state/advanced-mode/world-info/current'

export function useCurrentWorldInfoActions() {
  return useCurrentWorldInfoStore(
    useShallow((state) => ({
      setData: state.setData,
      setIsFetching: state.setIsFetching,
      setIsSaving: state.setIsSaving,
    }))
  )
}

export function useCurrentWorldInfoData() {
  return useCurrentWorldInfoStore(
    useShallow((state) => ({
      data: state.data,
      isFetching: state.isFetching,
      isSaving: state.isSaving,
    }))
  )
}
