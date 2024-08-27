import type {
  DeviceAuthInfo,
  DeviceAuthListResponse,
} from '../../types/services/authorizations'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export type DeviceAuthInfoWithStates = DeviceAuthInfo & {
  isDeleting: boolean
}

export type DevicesAuthState = {
  data: Array<DeviceAuthInfoWithStates>
  isFetching: boolean

  removeDevice: (deviceId: string) => void
  syncData: (data: DeviceAuthListResponse) => void
  updateDeletingState: (deviceId: string, value: boolean) => void
  updateFetching: (value: boolean) => void
}

export const useDevicesAuthStore = create<DevicesAuthState>()(
  immer((set, get) => ({
    data: [],
    isFetching: false,

    removeDevice: (deviceId) => {
      const data = get().data
      const current = data.find((item) => item.deviceId === deviceId)

      if (!current) {
        return
      }

      const newData = data.filter((item) => item.deviceId !== deviceId)

      set({ data: newData })
    },
    syncData: (data) => {
      const newData = data.map(
        (item) =>
          ({
            ...item,
            isDeleting: false,
          }) as DeviceAuthInfoWithStates
      )

      set({ data: newData })
    },
    updateDeletingState: (deviceId, value) => {
      const newData = get().data.map((item) => ({
        ...item,
        isDeleting: item.deviceId === deviceId ? value : item.isDeleting,
      }))

      set({ data: newData })
    },
    updateFetching: (value) => set({ isFetching: value }),
  }))
)
