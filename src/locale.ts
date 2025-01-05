import i18n, { use } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { resources } from './locales/resources'

use(initReactI18next).init({
  resources,
  lng: 'en-US',
  fallbackLng: 'en-US',
})

export { i18n }
