import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type AlertsOverviewPaginationState = {
  data: Record<
    string,
    {
      page: number
    }
  >

  changePage: (
    data: Record<
      string,
      {
        page: number
      }
    >
  ) => void
  initPagination: (ids: Array<string>) => void
}

export const useAlertsOverviewPaginationStore =
  create<AlertsOverviewPaginationState>()(
    immer((set) => ({
      data: {},

      changePage: (data) => {
        const entries = Object.entries(data)

        if (entries.length > 0) {
          set((state) => {
            entries.forEach(([zoneId, zone]) => {
              state.data[zoneId].page = zone.page ?? 1
            })
          })
        }
      },
      initPagination: (ids) => {
        if (ids.length > 0) {
          set((state) => {
            ids.forEach((id) => {
              state.data[id] = {
                page: 1,
              }
            })
          })

          return
        }

        set((state) => {
          state.data = Object.keys(state.data).reduce(
            (accumulator, current) => {
              accumulator[current] = {
                page: 1,
              }

              return accumulator
            },
            {} as AlertsOverviewPaginationState['data']
          )
        })
      },
    }))
  )
