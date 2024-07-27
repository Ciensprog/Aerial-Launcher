import { create } from 'zustand'

export type XPBoostsConsumeTeammateFormState = {
  isSubmitting: boolean

  updateIsSubmitting: (value: boolean) => void
}

export const useXPBoostsConsumeTeammateFormStore =
  create<XPBoostsConsumeTeammateFormState>()((set) => ({
    isSubmitting: false,

    updateIsSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
  }))
