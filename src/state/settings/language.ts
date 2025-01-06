import { create } from 'zustand'

import { Language } from '../../locales/resources'

export type LanguageState = {
  language: Language | null

  updateLanguage: (language: Language | null) => void
}

export const useLanguageStore = create<LanguageState>()((set) => ({
  language: null, // Language.English

  updateLanguage: (language) => {
    set({ language })
  },
}))
