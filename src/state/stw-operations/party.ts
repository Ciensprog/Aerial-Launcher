import type { ComboboxOption } from '../../components/ui/extended/combobox/hooks'
import type { FriendRecord } from '../../types/friends'

import { create } from 'zustand'

import { localeCompareForSorting } from '../../lib/utils'

export type PartyCommonSelectorState = {
  value: Array<ComboboxOption>

  setValue: (value: Array<ComboboxOption>) => void
}

export type PartyWithClaimState = PartyCommonSelectorState & {
  claimState: boolean

  changeClaimState: (claimState: boolean) => void
}

export type PartyFriends = {
  friends: FriendRecord

  increaseInvitations: (accountIds: Array<string>) => void
  syncFriends: (friends: FriendRecord) => void
}

export const useClaimRewardsSelectorStore =
  create<PartyCommonSelectorState>()((set) => ({
    value: [],

    setValue: (value) => set({ value }),
  }))

export const useKickAllPartySelectorStore = create<PartyWithClaimState>()(
  (set) => ({
    claimState: false,
    value: [],

    changeClaimState: (claimState) => set({ claimState }),
    setValue: (value) => set({ value }),
  })
)

export const useInviteFriendsSelectorStore =
  create<PartyCommonSelectorState>()((set) => ({
    value: [],

    setValue: (value) => set({ value }),
  }))

export const useLeavePartySelectorStore = create<PartyWithClaimState>()(
  (set) => ({
    claimState: false,
    value: [],

    changeClaimState: (claimState) => set({ claimState }),
    setValue: (value) => set({ value }),
  })
)

export const usePartyFriendsStore = create<PartyFriends>()((set, get) => ({
  friends: {},

  increaseInvitations: (accountIds) => {
    const friends = get().friends
    const toIncrease: FriendRecord = {}

    accountIds.forEach((accountId) => {
      const current = friends[accountId]

      if (current) {
        toIncrease[accountId] = {
          ...current,
          invitations: current.invitations + 1,
        }
      }
    })

    if (Object.keys(toIncrease).length <= 0) {
      return
    }

    const newValue = {
      ...friends,
      ...toIncrease,
    }

    set({ friends: newValue })
  },
  syncFriends: (friends) => {
    const newValue = Object.entries({
      ...get().friends,
      ...friends,
    })
      .toSorted(([, itemA], [, itemB]) =>
        localeCompareForSorting(itemA.displayName, itemB.displayName)
      )
      .reduce((accumulator, [accountId, data]) => {
        accumulator[accountId] = data

        return accumulator
      }, {} as FriendRecord)

    set({ friends: newValue })
  },
}))
