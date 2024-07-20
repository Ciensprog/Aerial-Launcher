import type { XPBoostType } from '../../../types/xpboosts'

import { create } from 'zustand'

export type XPBoostsFormState = {
  accounts: Array<string>
  isSubmitting: boolean
  tags: Array<string>

  updateAccounts: (accountIds: Array<string>) => void
  updateIsSubmitting: (isSubmitting: boolean) => void
  updateTags: (tags: Array<string>) => void
}

export type XPBoostsFormConsumeState = {
  isSubmittingPersonal: boolean
  isSubmittingTeammate: boolean

  updateIsSubmittingConsume: (type: XPBoostType, value: boolean) => void
}

export const useXPBoostsFormStore = create<XPBoostsFormState>()((set) => ({
  accounts: [],
  isSubmitting: false,
  tags: [],

  updateAccounts: (accountIds) =>
    set({
      accounts: [...new Set(accountIds)],
    }),
  updateIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  updateTags: (tags) =>
    set({
      tags: [...new Set(tags)],
    }),
}))

export const useXPBoostsFormConsumeStore =
  create<XPBoostsFormConsumeState>()((set) => ({
    isSubmittingPersonal: false,
    isSubmittingTeammate: false,

    updateIsSubmittingConsume: (type, value) =>
      set({
        [type === 'personal'
          ? 'isSubmittingPersonal'
          : 'isSubmittingTeammate']: value,
      }),
  }))
