import { useShallow } from 'zustand/react/shallow'

import {
  useAlertsDoneFormStore,
  useAlertsDonePlayerStore,
} from '../../state/alerts/alerts-done'

export function useAlertsDoneForm() {
  const {
    inputSearch,
    searchIsSubmitting,
    changeInputSearch,
    updateSearchIsSubmitting,
  } = useAlertsDoneFormStore(
    useShallow((state) => ({
      inputSearch: state.inputSearch,
      searchIsSubmitting: state.searchIsSubmitting,

      changeInputSearch: state.changeInputSearch,
      updateSearchIsSubmitting: state.updateSearchIsSubmitting,
    })),
  )

  return {
    inputSearch,
    searchIsSubmitting,
    changeInputSearch,
    updateSearchIsSubmitting,
  }
}

export function useAlertsDoneLoader() {
  const updateSearchIsSubmitting = useAlertsDoneFormStore(
    (state) => state.updateSearchIsSubmitting,
  )

  return {
    updateSearchIsSubmitting,
  }
}

export function useAlertsDoneData() {
  const playerData = useAlertsDonePlayerStore((state) => state.data)

  return {
    playerData,
  }
}

export function useAlertsDoneDataActions() {
  const updateData = useAlertsDonePlayerStore((state) => state.updateData)

  return {
    updateData,
  }
}

export function useAlertsDoneMarkedActions({
  accountId,
  missionGuid,
}: {
  accountId: string | null | undefined
  missionGuid: string
}) {
  const { marked, syncMarked } = useAlertsDonePlayerStore(
    useShallow((state) => ({
      marked: state.marked,
      syncMarked: state.syncMarked,
    })),
  )

  const isCompleted = accountId
    ? marked[accountId]?.[missionGuid] ?? false
    : false

  const toggleCompleted = () => {
    if (!accountId) {
      return
    }

    syncMarked(accountId, {
      [missionGuid]: !isCompleted,
    })
  }

  return {
    isCompleted,
    toggleCompleted,
  }
}

export function useAlertsDoneMarkedSync() {
  const syncMarked = useAlertsDonePlayerStore((state) => state.syncMarked)

  const syncCompletedAlerts = (
    accountId: string,
    data: Record<string, boolean> | null,
  ) => {
    syncMarked(accountId, data)
  }

  return {
    syncCompletedAlerts,
  }
}
