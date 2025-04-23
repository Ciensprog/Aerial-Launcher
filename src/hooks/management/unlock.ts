import { useShallow } from 'zustand/react/shallow'

import { useUnlockStatusStore } from '../../state/accounts/unlock'

export function useUnlockStatusData() {
  const { data, updateUnlockStatus, clearData } = useUnlockStatusStore(
    useShallow((state) => ({
      data: state.data,
      updateUnlockStatus: state.updateUnlockStatus,
      clearData: state.clearData,
    }))
  )

  return {
    data,

    updateUnlockStatus,
    clearData,
  }
}
