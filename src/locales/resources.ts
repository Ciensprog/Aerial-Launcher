import type { Resource } from 'i18next'

/**
 * @file en-US
 */
import enUS_sidebar from './en-US/sidebar.json'
import enUS_general from './en-US/general.json'
import enUS_history from './en-US/history.json'
import enUS_settings from './en-US/settings.json'

const enUS = {
  sidebar: enUS_sidebar,
  general: enUS_general,
  history: enUS_history,
  settings: enUS_settings,
}

/**
 * @file es-419
 */
import es419_sidebar from './es-419/sidebar.json'
import es419_general from './es-419/general.json'
import es419_history from './es-419/history.json'
import es419_settings from './es-419/settings.json'

const es419 = {
  sidebar: es419_sidebar,
  general: es419_general,
  history: es419_history,
  settings: es419_settings,
}

/**
 * Export resources
 */
export const resources: Resource = {
  'en-US': enUS,
  'es-419': es419,
}
