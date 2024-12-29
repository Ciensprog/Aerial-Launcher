import type { Resource } from 'i18next'

/**
 * @file en-US
 */
import enUS_sidebar from './en-US/sidebar.json'
import enUS_general from './en-US/general.json'
import enUS_history from './en-US/history.json'
import enUS_settings from './en-US/settings.json'
import enUS_stwOperations_AutoKick from './en-US/stw-operations/auto-kick.json'
import enUS_stwOperations_HomebaseName from './en-US/stw-operations/homebase-name.json'
import enUS_stwOperations_SaveQuests from './en-US/stw-operations/save-quests.json'
import enUS_stwOperations_Party from './en-US/stw-operations/party.json'
import enUS_stwOperations_Urns from './en-US/stw-operations/urns.json'
import enUS_stwOperations_XPBoosts from './en-US/stw-operations/xpboosts.json'

const enUS = {
  sidebar: enUS_sidebar,
  general: enUS_general,
  history: enUS_history,
  settings: enUS_settings,
  'stw-operations': {
    'auto-kick': enUS_stwOperations_AutoKick,
    'homebase-name': enUS_stwOperations_HomebaseName,
    'save-quests': enUS_stwOperations_SaveQuests,
    party: enUS_stwOperations_Party,
    urns: enUS_stwOperations_Urns,
    xpboosts: enUS_stwOperations_XPBoosts,
  },
}

/**
 * @file es-419
 */
import es419_sidebar from './es-419/sidebar.json'
import es419_general from './es-419/general.json'
import es419_history from './es-419/history.json'
import es419_settings from './es-419/settings.json'
import es419_stwOperations_AutoKick from './es-419/stw-operations/auto-kick.json'
import es419_stwOperations_HomebaseName from './es-419/stw-operations/homebase-name.json'
import es419_stwOperations_SaveQuests from './es-419/stw-operations/save-quests.json'
import es419_stwOperations_Party from './es-419/stw-operations/party.json'
import es419_stwOperations_Urns from './es-419/stw-operations/urns.json'
import es419_stwOperations_XPBoosts from './es-419/stw-operations/xpboosts.json'

const es419 = {
  sidebar: es419_sidebar,
  general: es419_general,
  history: es419_history,
  settings: es419_settings,
  'stw-operations': {
    'auto-kick': es419_stwOperations_AutoKick,
    'homebase-name': es419_stwOperations_HomebaseName,
    'save-quests': es419_stwOperations_SaveQuests,
    party: es419_stwOperations_Party,
    urns: es419_stwOperations_Urns,
    xpboosts: es419_stwOperations_XPBoosts,
  },
}

/**
 * Export resources
 */
export const resources: Resource = {
  'en-US': enUS,
  'es-419': es419,
}
