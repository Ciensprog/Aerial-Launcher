import { useShallow } from 'zustand/react/shallow'

import { useAccountListStore } from '../state/accounts/list'

export function useGetSelectedAccount() {
  const { selected } = useAccountListStore(
    useShallow((state) => ({
      currentSelected: state.selected,
      selected: state.getSelected(),
    }))
  )

  return { selected }
}
