import type { ComboboxOption } from '../../components/ui/extended/combobox/hooks'

import { create } from 'zustand'

export type PartyCommonSelectorState = {
  value: Array<ComboboxOption>

  setValue: (value: Array<ComboboxOption>) => void
}

export type PartyWithClaimState = PartyCommonSelectorState & {
  claimState: boolean

  changeClaimState: (claimState: boolean) => void
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
