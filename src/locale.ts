import i18n, { use } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { defaultAppLanguage } from './config/constants/settings'

import { Language, resources } from './locales/resources'

use(initReactI18next).init({
  resources,
  lng: defaultAppLanguage,
  fallbackLng: Language.English,
})

export { i18n }
