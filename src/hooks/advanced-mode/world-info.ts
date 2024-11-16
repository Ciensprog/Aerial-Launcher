import { useShallow } from 'zustand/react/shallow'

import { useWorldInfoStore } from '../../state/advanced-mode/world-info/home/data'
import { useCurrentWorldInfoStore } from '../../state/advanced-mode/world-info/current'
import { useWorldInfoFilesStore } from '../../state/advanced-mode/world-info/files'

export function useWorldInfo() {
  return useWorldInfoStore(
    useShallow((state) => ({
      data: state.data,
      isFetching: state.isFetching,
      isReloading: state.isReloading,
    }))
  )
}

export function useWorldInfoActions() {
  return useWorldInfoStore(
    useShallow((state) => ({
      setWorldInfoData: state.setWorldInfoData,
      updateWorldInfoLoading: state.updateWorldInfoLoading,
    }))
  )
}

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

export function useWorldInfoFiles() {
  const files = useWorldInfoFilesStore((state) => state.files)

  return { files }
}

export function useWorldInfoFilesActions() {
  const setFiles = useWorldInfoFilesStore((state) => state.setFiles)

  return { setFiles }
}
