import type {
  TaxiServiceAccountData,
  TaxiServiceAccountDataList,
} from '../../types/taxi-service'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

export enum TaxiServiceNotificationType {
  PartyMemberJoined = 'party:member:joined',
  PartyInvite = 'party:invite',
  FriendAdded = 'friend:added',
  FriendRequestSend = 'friend:request:send',
}

export type TaxiServiceNotificationEventFriendAdded = {
  id: string
  type: TaxiServiceNotificationType.FriendAdded
  createdAt: string
  me: {
    accountId: string
    displayName: string
  }
  friend: {
    accountId: string
    displayName: string
  }
}
export type TaxiServiceNotificationEventFriendRequestSend = {
  id: string
  type: TaxiServiceNotificationType.FriendRequestSend
  createdAt: string
  me: {
    accountId: string
    displayName: string
  }
  accounts: Array<{
    accountId: string
    displayName: string
    error?: string
  }>
  withErrors: boolean
}
export type TaxiServiceNotificationEventPartyInvite = {
  id: string
  type: TaxiServiceNotificationType.PartyInvite
  createdAt: string
  me: {
    accountId: string
    displayName: string
  }
  friend: {
    accountId: string
    displayName: string
  }
}
export type TaxiServiceNotificationEventPartyMemberJoined = {
  id: string
  type: TaxiServiceNotificationType.PartyMemberJoined
  createdAt: string
  me: {
    accountId: string
    displayName: string
  }
  members: Array<{
    accountId: string
    displayName: string
    isLeader: boolean
    isSender: boolean
  }>
}

export type TaxiServiceState = {
  accounts: TaxiServiceAccountDataList

  addOrUpdateAccount: (
    accountId: string,
    defaultConfig?: Partial<{
      actions: Partial<TaxiServiceAccountData['actions']>
      status: Partial<TaxiServiceAccountData['status']>
      submittings: Partial<TaxiServiceAccountData['submittings']>
    }>,
  ) => void
  refreshAccounts: (
    data: Record<
      string,
      Omit<TaxiServiceAccountData, 'submittings'> &
        Partial<{
          submittings: Partial<TaxiServiceAccountData['submittings']>
        }>
    >,
  ) => void
  removeAccount: (accountId: string) => void
  removeAllAccounts: () => void
  updateAccountAction: (
    type: keyof TaxiServiceAccountData['actions'],
    config: {
      accountId: string
      value: boolean | string
    },
  ) => void
  updateAccountStatus: (
    accountId: string,
    value: TaxiServiceAccountData['status'],
  ) => void
  updateAccountSubmitting: (
    type: keyof TaxiServiceAccountData['submittings'],
    config: {
      accountId: string
      value: boolean
    },
  ) => void
}

export type TaxiServiceNotificationsState = {
  data: Array<
    | TaxiServiceNotificationEventFriendAdded
    | TaxiServiceNotificationEventFriendRequestSend
    | TaxiServiceNotificationEventPartyInvite
    | TaxiServiceNotificationEventPartyMemberJoined
  >

  clearData: () => void
  updateData: (
    value: Array<
      | TaxiServiceNotificationEventFriendAdded
      | TaxiServiceNotificationEventFriendRequestSend
      | TaxiServiceNotificationEventPartyInvite
      | TaxiServiceNotificationEventPartyMemberJoined
    >,
  ) => void
}

export const useTaxiServiceStore = create<TaxiServiceState>()(
  immer((set, get) => ({
    accounts: {},

    addOrUpdateAccount: (accountId, defaultConfig) => {
      set((state) => {
        const current = state.accounts[accountId] ?? {}

        state.accounts[accountId] = {
          accountId,
          actions: {
            high:
              defaultConfig?.actions?.high ??
              current?.actions?.high ??
              true,
            denyFriendsRequests:
              defaultConfig?.actions?.denyFriendsRequests ??
              current?.actions?.denyFriendsRequests ??
              true,
            activeStatus:
              defaultConfig?.actions?.activeStatus ??
              current?.actions?.activeStatus ??
              '',
            busyStatus:
              defaultConfig?.actions?.busyStatus ??
              current?.actions?.busyStatus ??
              '',
          },
          status: defaultConfig?.status ?? current?.status ?? null,
          submittings: {
            connecting:
              defaultConfig?.submittings?.connecting ??
              current?.submittings?.connecting ??
              false,
            removing:
              defaultConfig?.submittings?.removing ??
              current?.submittings?.removing ??
              false,
          },
        }
      })
    },
    refreshAccounts: (data) => {
      const accounts = get().accounts
      const filteredAccounts = Object.values(data)
        .map((account) => ({
          ...accounts[account.accountId],
        }))
        .reduce((accumulator, current) => {
          accumulator[current.accountId] = current

          return accumulator
        }, {} as TaxiServiceAccountDataList)

      set({
        accounts: filteredAccounts,
      })
    },
    removeAccount: (accountId) => {
      const accounts = Object.values(get().accounts)
      const filtered = accounts
        .filter((account) => account.accountId !== accountId)
        .reduce((accumulator, current) => {
          accumulator[current.accountId] = current

          return accumulator
        }, {} as TaxiServiceAccountDataList)

      set({
        accounts: filtered,
      })
    },
    removeAllAccounts: () => {
      set({ accounts: {} })
    },
    updateAccountAction: (type, config) => {
      set((state) => {
        // eslint-disable-next-line no-extra-semi
        ;(
          state.accounts[config.accountId].actions as Record<
            string,
            unknown
          >
        )[type] =
          typeof config.value === 'boolean' ? config.value : config.value
      })
    },
    updateAccountStatus: (accountId, value) => {
      set((state) => {
        state.accounts[accountId].status = value
      })
    },
    updateAccountSubmitting: (type, config) => {
      set((state) => {
        state.accounts[config.accountId].submittings[type] = config.value
      })
    },
  })),
)

export const useTaxiServiceNotificationsStore =
  create<TaxiServiceNotificationsState>()((set) => ({
    data: [] as TaxiServiceNotificationsState['data'],

    clearData: () => set({ data: [] }),
    updateData: (data) =>
      set((state) => ({ data: [...data, ...state.data] })),
  }))
