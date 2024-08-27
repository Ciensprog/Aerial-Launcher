import { useShallow } from 'zustand/react/shallow'

import { useDevicesAuthStore } from '../../state/accounts/devices-auth'

export function useDevicesAuthData() {
  const { data, isFetching } = useDevicesAuthStore(
    useShallow((state) => ({
      data: state.data,
      isFetching: state.isFetching,
    }))
  )

  return {
    data,
    isFetching,
  }
}

export function useDevicesAuthActions() {
  const { removeDevice, syncData, updateDeletingState, updateFetching } =
    useDevicesAuthStore(
      useShallow((state) => ({
        removeDevice: state.removeDevice,
        syncData: state.syncData,
        updateDeletingState: state.updateDeletingState,
        updateFetching: state.updateFetching,
      }))
    )

  return {
    removeDevice,
    syncData,
    updateDeletingState,
    updateFetching,
  }
}
