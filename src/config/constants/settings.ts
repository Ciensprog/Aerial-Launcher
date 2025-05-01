import { Language } from '../../locales/resources'

export const defaultAppLanguage: Language = Language.English
export const availableLanguages: Array<{
  id: Language
  title: string
  completed?: boolean
}> = [
  {
    id: Language.English,
    title: 'English',
  },
  {
    id: Language.Spanish,
    title: 'Español',
  },
  {
    id: Language.Chinese,
    title: '简体中文',
  },
  {
    id: Language.Russian,
    title: 'Русский',
  },
  {
    id: Language.Portuguese,
    title: 'Português',
  },
]
