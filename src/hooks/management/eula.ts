import { useShallow } from 'zustand/react/shallow'

import { useEULAStatusStore } from '../../state/accounts/eula'

export function useEULAData() {
  const { data, updateEULAAccountStatus } = useEULAStatusStore(
    useShallow((state) => ({
      data: state.data,
      updateEULAAccountStatus: state.updateEULAAccountStatus,
    }))
  )

  return {
    data,

    updateEULAAccountStatus,
  }
}
