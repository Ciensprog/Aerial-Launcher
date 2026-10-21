// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge } from 'electron'

import * as accountExportActions from './preload-actions/account-export'
import * as accountsActions from './preload-actions/accounts'
import * as alertsActions from './preload-actions/alerts'
import * as authenticationActions from './preload-actions/authentication'
import * as autoLlamasActions from './preload-actions/auto-llamas'
import * as autoPinUrnsActions from './preload-actions/auto-pin-urns'
import * as automationsActions from './preload-actions/automation'
import * as cloudStorageActions from './preload-actions/cloud-storage'
import * as collectionBookActions from './preload-actions/collection-book'
import * as customizableMenuActions from './preload-actions/customizable-menu'
import * as devicesAuthActions from './preload-actions/devices-auth'
import * as eventActions from './preload-actions/events'
import * as fortniteToolsActions from './preload-actions/fortnite-tools'
import * as gamesLauncherActions from './preload-actions/games-launcher'
import * as generalActions from './preload-actions/general'
import * as launcherActions from './preload-actions/launcher'
import * as itemShopActions from './preload-actions/item-shop'
import * as llamaManagerActions from './preload-actions/llama-manager'
import * as matchmakingActions from './preload-actions/matchmaking'
import * as mcpActions from './preload-actions/mcp'
import * as partyActions from './preload-actions/party'
import * as redeemCodesActions from './preload-actions/redeem-codes'
import * as requestActions from './preload-actions/requests'
import * as scheduleActions from './preload-actions/schedules'
import * as settingsActions from './preload-actions/settings'
import * as taxiservicesActions from './preload-actions/taxi-service'
import * as vbucksInformationActions from './preload-actions/vbucks-information'
import * as xpBoostsActions from './preload-actions/xpboosts'
import * as worldInfoActions from './preload-actions/world-info'

export const availableElectronAPIs = {
  ...accountExportActions,
  ...accountsActions,
  ...alertsActions,
  ...authenticationActions,
  ...autoLlamasActions,
  ...automationsActions,
  ...cloudStorageActions,
  ...collectionBookActions,
  ...customizableMenuActions,
  ...autoPinUrnsActions,
  ...devicesAuthActions,
  ...eventActions,
  ...fortniteToolsActions,
  ...gamesLauncherActions,
  ...generalActions,
  ...launcherActions,
  ...itemShopActions,
  ...llamaManagerActions,
  ...partyActions,
  ...redeemCodesActions,
  ...matchmakingActions,
  ...mcpActions,
  ...requestActions,
  ...scheduleActions,
  ...settingsActions,
  ...taxiservicesActions,
  ...vbucksInformationActions,
  ...xpBoostsActions,
  ...worldInfoActions,
} as const

contextBridge.exposeInMainWorld('electronAPI', availableElectronAPIs)
