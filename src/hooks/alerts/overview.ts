import { useShallow } from 'zustand/react/shallow'
import { useAlertsOverviewPaginationStore } from '../../state/alerts/overview'

export function useAlertsOverviewPaginationInit() {
  const { initPagination } = useAlertsOverviewPaginationStore(
    useShallow((state) => ({
      initPagination: state.initPagination,
    }))
  )

  return {
    initPagination,
  }
}

export function useAlertsOverviewPaginationData({ id }: { id: string }) {
  const { page, setPage } = useAlertsOverviewPaginationStore(
    useShallow((state) => ({
      page: state.data[id].page,

      setPage: (page: number) =>
        state.changePage({
          [id]: {
            page,
          },
        }),
    }))
  )

  return {
    page,
    setPage,
  }
}
