import type {
  EpicFriend,
  FriendBlock,
  FriendIncoming,
  FriendOutgoing,
  FriendsSummary,
} from '../../types/services/friends'

import { immer } from 'zustand/middleware/immer'
import { create } from 'zustand'

import { localeCompareForSorting } from '../../lib/utils'

export type FriendsState = {
  accounts: Record<string, FriendsSummary>
  isLoading: boolean
  selected: string | null

  changeSelection: (value: string | null) => void
  getSummary: (accountId?: string | null) => FriendsSummary | null
  removeFriends: (accountId: string, ids?: Array<string>) => void
  syncIncoming: (
    type: 'add' | 'remove',
    accountId: string,
    incoming?: Array<EpicFriend | FriendIncoming | FriendBlock>
  ) => void
  syncOutgoing: (
    type: 'add' | 'remove',
    accountId: string,
    outgoing?: Array<FriendOutgoing | FriendBlock>
  ) => void
  syncBlocklist: (
    type: 'add' | 'remove',
    accountId: string,
    blocklist?: Array<FriendBlock>
  ) => void
  syncSummary: (accountId: string, summary: FriendsSummary | null) => void
  updateLoading: (value: boolean) => void
}

export const defaultFriendsSummary: FriendsSummary = {
  friends: [],
  incoming: [],
  outgoing: [],
  blocklist: [],
  suggested: [],
  settings: null,
  limitsReached: null,
}

export const useFriendsStore = create<FriendsState>()(
  immer((set, get) => ({
    accounts: {},
    isLoading: false,
    selected: null,

    changeSelection: (selected) =>
      set({
        selected,
      }),
    getSummary: (accountId) => {
      if (accountId === undefined) {
        const selected = get().selected

        if (!selected) {
          return null
        }

        return get().accounts[selected] ?? null
      }

      if (!accountId) {
        return null
      }

      return get().accounts[accountId] ?? null
    },
    removeFriends: (accountId, ids) => {
      const current = get().accounts[accountId]

      if (!current || (ids && ids.length <= 0)) {
        return
      }

      if (ids === undefined) {
        set((state) => {
          state.accounts[accountId].friends = []
        })

        return
      }

      set((state) => {
        state.accounts[accountId].friends = state.accounts[
          accountId
        ].friends.filter((friend) => !ids.includes(friend.accountId))
      })
    },
    syncIncoming: (type, accountId, incoming) => {
      const current = get().accounts[accountId]

      if (!current || (incoming && incoming.length <= 0)) {
        return
      }

      if (incoming === undefined) {
        set((state) => {
          state.accounts[accountId].incoming = []
        })

        return
      }

      if (type === 'add') {
        const list = [...current.incoming, ...incoming].toSorted(
          (itemA, itemB) =>
            localeCompareForSorting(itemA.displayName!, itemB.displayName!)
        )

        set((state) => {
          state.accounts[accountId].incoming = list.map(
            (item) =>
              ({
                accountId: item.accountId,
                created: item.created,
                favorite: false,
                mutual: 0,
                displayName: item.displayName,
              }) as FriendIncoming
          )
        })

        return
      }

      const ids = incoming.map((item) => item.accountId)

      set((state) => {
        state.accounts[accountId].incoming = current.incoming.filter(
          (item) => !ids.includes(item.accountId)
        )
      })
    },
    syncOutgoing: (type, accountId, outgoing) => {
      const current = get().accounts[accountId]

      if (!current || (outgoing && outgoing.length <= 0)) {
        return
      }

      if (outgoing === undefined) {
        set((state) => {
          state.accounts[accountId].outgoing = []
        })

        return
      }

      if (type === 'add') {
        const list = [...current.outgoing, ...outgoing].toSorted(
          (itemA, itemB) =>
            localeCompareForSorting(itemA.displayName!, itemB.displayName!)
        )

        set((state) => {
          state.accounts[accountId].outgoing = list.map(
            (item) =>
              ({
                accountId: item.accountId,
                created: item.created,
                favorite: false,
                mutual: 0,
                displayName: item.displayName,
              }) as FriendOutgoing
          )
        })

        return
      }

      const ids = outgoing.map((item) => item.accountId)

      set((state) => {
        state.accounts[accountId].outgoing = current.outgoing.filter(
          (item) => !ids.includes(item.accountId)
        )
      })
    },
    syncBlocklist: (type, accountId, blocklist) => {
      const current = get().accounts[accountId]

      if (!current || (blocklist && blocklist.length <= 0)) {
        return
      }

      if (blocklist === undefined) {
        set((state) => {
          state.accounts[accountId].blocklist = []
        })

        return
      }

      if (type === 'add') {
        const list = [...current.blocklist, ...blocklist].toSorted(
          (itemA, itemB) =>
            localeCompareForSorting(itemA.displayName!, itemB.displayName!)
        )

        set((state) => {
          state.accounts[accountId].blocklist = list
        })

        return
      }

      const ids = blocklist.map((item) => item.accountId)

      set((state) => {
        state.accounts[accountId].blocklist = current.blocklist.filter(
          (item) => !ids.includes(item.accountId)
        )
      })
    },
    syncSummary: (accountId, summary) => {
      set((state) => {
        state.accounts[accountId] = summary ?? defaultFriendsSummary
      })
    },
    updateLoading: (isLoading) => set({ isLoading }),
  }))
)
