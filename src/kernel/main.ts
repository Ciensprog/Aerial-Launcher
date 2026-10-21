import type {
  SaveWorldInfoData,
  WorldInfoFileData,
} from '../types/data/advanced-mode/world-info'
import type {
  AccountBasicInfo,
  AccountData,
  AccountDataList,
  AccountDataRecord,
  AccountList,
} from '../types/accounts'
import type { AlertsDoneSearchPlayerConfig } from '../types/alerts'
import type { AuthenticationByDeviceProperties } from '../types/authentication'
import type {
  AutomationLogFileSettings,
  AutomationServiceActionConfig,
} from '../types/automation'
import type { GroupRecord } from '../types/groups'
import type { CustomizableMenuSettings, Settings } from '../types/settings'
import type { MenuCategory, MenuVisibilityKey } from '../lib/settings/menu-layout'
import type { TagRecord } from '../types/tags'
import type { TaxiServiceServiceActionConfig } from '../types/taxi-service'
import type {
  CollectionBookSlotRequest,
  CollectionBookUpgradeRequest,
} from '../types/collection-book'
import type {
  ItemShopCreatorCodeRequest,
  ItemShopGiftRequest,
  ItemShopPurchaseRequest,
} from '../types/item-shop'
import type {
  LlamaManagerBulkPurchaseRequest,
  LlamaManagerOpenChoiceRequest,
  LlamaManagerOpenRequest,
  LlamaManagerPurchaseRequest,
} from '../types/llama-manager'
import type { AccountExportRequest } from '../types/account-export'
import type { AccountInfoProfileId } from '../types/account-info'
import type {
  CloudStorageApplyRequest,
  CloudStorageDownloadRequest,
} from '../types/cloud-storage'
import type {
  XPBoostsConsumePersonalData,
  XPBoostsConsumeTeammateData,
  XPBoostsSearchUserConfig,
} from '../types/xpboosts'

import path from 'node:path'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import dayjs from 'dayjs'
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
import schedule from 'node-schedule'

import { ElectronAPIEventKeys } from '../config/constants/main-process'

import { AlertsDone } from './core/alerts'
// import { AntiCheatProvider } from './core/anti-cheat-provider'
import { AccountExport } from './core/account-export'
import { Authentication } from './core/authentication'
import { AutomationLogFile } from './core/automation/log-file'
import { CloudStorage } from './core/cloud-storage'
import { ClaimRewards } from './core/claim-rewards'
import { CollectionBookManager } from './core/collection-book'
import { DevicesAuthManager } from './core/devices-auth'
import { EULATracking } from './core/eula-tracking'
import { FortniteLauncher } from './core/launcher'
import { GamesLauncher } from './core/games-launcher'
import { ItemShop } from './core/item-shop'
import {
  registerItemShopProtocol,
  registerItemShopScheme,
} from './core/item-shop-protocol'
import { LlamaManager } from './core/llama-manager'
import { registerFortniteToolsHandlers } from './core/fortnite-tools/register-handlers'
import {
  MCPAccountInfo,
  MCPClientQuestLogin,
  MCPDailyQuests,
  MCPDqWeapons,
  MCPHomebaseName,
  MCPStormShields,
} from './core/mcp'
import { MatchmakingTrack } from './core/matchmaking-track'
import { Manifest } from './core/manifest'
import { Party } from './core/party'
import { RedeemCodes } from './core/redeem-codes'
import { Unlock } from './core/unlock'
import { VBucksInformation } from './core/vbucks-information'
import { WorldInfoManager } from './core/world-info'
import { XPBoostsManager } from './core/xpboosts'
import { MainWindow } from './startup/windows/main'
import { AccountsManager } from './startup/accounts'
import { Application } from './startup/application'
import {
  AutoLlamas,
  ProcessAutoLlamas,
  ProcessLlamaType,
} from './startup/auto-llamas'
import { AutoPinUrns } from './startup/auto-pin-urns'
import { Automation } from './startup/automation'
import { DataDirectory } from './startup/data-directory'
import { GroupsManager } from './startup/groups'
import {
  AppLanguage,
  CustomizableMenuSettingsManager,
  DevSettingsManager,
  SettingsManager,
} from './startup/settings'
import { SystemTray } from './startup/system-tray'
import { TagsManager } from './startup/tags'
import { TaxiService } from './startup/taxi-service'

import {
  AutoLlamasAccountAddParams,
  AutoLlamasAccountUpdateParams,
} from '../state/stw-operations/auto/llamas'

import { Language } from '../locales/resources'
import { CustomProcess } from './core/custom-process'
import { OverlayToasts } from './core/overlay-toasts'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(utc)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line @typescript-eslint/no-require-imports
if (require('electron-squirrel-startup')) {
  app.quit()
}

const gotTheLock = app.requestSingleInstanceLock()

if (gotTheLock) {
  registerItemShopScheme()
}

void (() => {
  if (!gotTheLock) {
    return app.quit()
  }

  const createWindow = async () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      center: true,
      frame: false,
      height: 600,
      width: 800,
      minHeight: 400,
      minWidth: 600,
      webPreferences: {
        devTools: !app.isPackaged,
        preload: path.join(__dirname, 'preload.js'),
        spellcheck: false,
      },
    })

    const manifest = Manifest.getData()

    if (manifest) {
      mainWindow.webContents.setUserAgent(manifest.UserAgent)
    }

    const browserUserAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

    mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
      {
        urls: [
          'https://fortnite-api.com/*',
          'https://*.fortnite-api.com/*',
          'https://api.miadsc.xyz/*',
        ],
      },
      (details, callback) => {
        details.requestHeaders['User-Agent'] = browserUserAgent
        callback({ requestHeaders: details.requestHeaders })
      },
    )

    MainWindow.setInstance(mainWindow)

    mainWindow.on('closed', () => {
      OverlayToasts.destroy()
    })

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.webContents.openDevTools({
        mode: 'undocked',
      })

      await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    } else {
      await mainWindow.loadFile(
        path.join(
          __dirname,
          `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
        ),
      )
    }

    return mainWindow
  }

  Menu.setApplicationMenu(null)

  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (MainWindow.instance) {
      if (SystemTray.isActive) {
        if (!MainWindow.instance.isVisible()) {
          MainWindow.instance.show()
        }
      } else {
        if (MainWindow.instance.isMinimized()) {
          MainWindow.instance.restore()
        }
      }

      MainWindow.instance.focus()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async () => {
    try {
      await DataDirectory.createDataResources()
      await AccountsManager.loadFromDisk()
    } catch {
      //
    }

    registerItemShopProtocol()

    ipcMain.on(ElectronAPIEventKeys.RequestAccounts, async () => {
      await AccountsManager.load()
    })

    ipcMain.on(ElectronAPIEventKeys.HomeWorldInfoRequest, async () => {
      await WorldInfoManager.requestForHome()
    })

    ipcMain.on(ElectronAPIEventKeys.WorldInfoRequestData, async () => {
      await WorldInfoManager.requestForAdvanceSection()
    })

    MainWindow.setInstance(await createWindow())

    /**
     * Paths
     */

    ipcMain.on(ElectronAPIEventKeys.GetMatchmakingTrackPath, async () => {
      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.GetMatchmakingTrackPathNotification,
        DataDirectory.matchmakingFilePath,
      )
    })

    /**
     * Settings
     */

    ipcMain.on(ElectronAPIEventKeys.AppLanguageRequest, async () => {
      await AppLanguage.load()
    })

    ipcMain.on(
      ElectronAPIEventKeys.AppLanguageUpdate,
      async (_, language: Language) => {
        await AppLanguage.update(language)
      },
    )

    ipcMain.on(ElectronAPIEventKeys.RequestSettings, async () => {
      await SettingsManager.load()
    })

    ipcMain.on(ElectronAPIEventKeys.DevSettingsRequest, async () => {
      await DevSettingsManager.load()
    })

    ipcMain.on(
      ElectronAPIEventKeys.CustomizableMenuSettingsRequest,
      async () => {
        await CustomizableMenuSettingsManager.load()
      },
    )

    ipcMain.on(ElectronAPIEventKeys.RequestTags, async () => {
      await TagsManager.load()
    })

    ipcMain.on(ElectronAPIEventKeys.RequestGroups, async () => {
      await GroupsManager.load()
    })

    ipcMain.on(
      ElectronAPIEventKeys.UpdateSettings,
      async (_, settings: Settings) => {
        await SettingsManager.update(settings)
      },
    )

    ipcMain.handle(ElectronAPIEventKeys.SettingsDetectPath, () => {
      return SettingsManager.detectGamePath({
        namespaceId: 'fn',
      })
    })

    ipcMain.on(
      ElectronAPIEventKeys.AccountsOrderingSync,
      async (_, accounts: AccountDataRecord) => {
        await AccountsManager.reorder(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.CustomizableMenuSettingsUpdate,
      async (
        _,
        key: MenuVisibilityKey,
        visibility: boolean,
      ) => {
        await CustomizableMenuSettingsManager.update(key, visibility)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.CustomizableMenuSettingsUpdateLayout,
      async (_, categories: Array<MenuCategory>) => {
        await CustomizableMenuSettingsManager.updateLayout(categories)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.UpdateTags,
      async (_, tags: TagRecord) => {
        await TagsManager.update(tags)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.UpdateGroups,
      async (_, groups: GroupRecord) => {
        await GroupsManager.update(groups)
      },
    )

    ipcMain.on(ElectronAPIEventKeys.CustomProcessKill, () => {
      CustomProcess.kill()
    })

    /**
     * General Methods
     */

    ipcMain.on(ElectronAPIEventKeys.OpenExternalURL, (_, url: string) => {
      shell.openExternal(url)
    })

    ipcMain.on(ElectronAPIEventKeys.CloseWindow, () => {
      if (SystemTray.isActive) {
        MainWindow.closeApp()
      } else {
        MainWindow.instance.close()
      }
    })

    ipcMain.on(ElectronAPIEventKeys.MinimizeWindow, () => {
      if (SystemTray.isActive) {
        MainWindow.instance.hide()
      } else {
        MainWindow.instance.minimize()
      }
    })

    /**
     * Events
     */

    ipcMain.on(
      ElectronAPIEventKeys.OnRemoveAccount,
      async (_, accountId: string) => {
        await AccountsManager.remove(accountId)
      },
    )

    /**
     * Requests
     */

    // ipcMain.on(
    //   ElectronAPIEventKeys.RequestProviderAndAccessTokenOnStartup,
    //   async (_, account: AccountData) => {
    //     const response = await AntiCheatProvider.request(account)

    //     MainWindow.instance.webContents.send(
    //       ElectronAPIEventKeys.ResponseProviderAndAccessTokenOnStartup,
    //       response
    //     )
    //   }
    // )

    /**
     * Authentication
     */

    ipcMain.on(
      ElectronAPIEventKeys.CreateAuthWithExchange,
      async (_, code: string) => {
        await Authentication.exchange(code)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.CreateAuthWithAuthorization,
      async (_, code: string) => {
        await Authentication.authorization(code)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.CreateAuthWithDevice,
      async (_, data: AuthenticationByDeviceProperties) => {
        await Authentication.device(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.OpenEpicGamesSettings,
      async (_, account: AccountData) => {
        await Authentication.openEpicGamesSettings(account)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.GenerateExchangeCode,
      async (_, account: AccountData) => {
        await Authentication.generateExchangeCode(account)
      },
    )

    ipcMain.on(ElectronAPIEventKeys.RequestNewVersionStatus, async () => {
      await Application.checkVersion()
    })

    /**
     * Launcher
     */

    ipcMain.on(
      ElectronAPIEventKeys.LauncherStart,
      async (_, account: AccountData) => {
        await FortniteLauncher.start(account)
      },
    )

    ipcMain.handle(
      ElectronAPIEventKeys.LauncherGenerateCmd,
      async (_, account: AccountData) => {
        return FortniteLauncher.generateCmd(account)
      },
    )

    ipcMain.handle(ElectronAPIEventKeys.GamesLauncherScan, async () => {
      return GamesLauncher.scan()
    })

    ipcMain.handle(ElectronAPIEventKeys.GamesLauncherPickDir, async () => {
      return GamesLauncher.pickEpicDir()
    })

    registerFortniteToolsHandlers(ipcMain)

    ipcMain.on(
      ElectronAPIEventKeys.GamesLauncherStart,
      async (_, payload) => {
        await GamesLauncher.launch(payload.account, payload.game)
      },
    )

    /**
     * STW Operations
     */

    ipcMain.on(
      ElectronAPIEventKeys.SetSaveQuests,
      async (_, accounts: Array<AccountData>) => {
        await MCPClientQuestLogin.save(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.DailyQuestsRequest,
      async (_, accounts: Array<AccountData>) => {
        await MCPDailyQuests.request(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.DailyQuestReroll,
      async (_, account: AccountData, questId: string) => {
        await MCPDailyQuests.reroll(account, questId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.DqWeaponsRequest,
      async (_, accounts: Array<AccountData>) => {
        await MCPDqWeapons.request(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.DqWeaponsFavoriteRequest,
      async (_, accounts: Array<AccountData>) => {
        await MCPDqWeapons.favorite(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.StormShieldsRequest,
      async (_, accounts: Array<AccountData>) => {
        await MCPStormShields.request(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AccountInfoRequest,
      async (_, accounts: Array<AccountData>) => {
        await MCPAccountInfo.request(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AccountInfoRecycleRequest,
      async (
        _,
        account: AccountData,
        itemId: string,
        profileId?: AccountInfoProfileId,
      ) => {
        await MCPAccountInfo.recycle(account, itemId, profileId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AccountInfoUpgradeRequest,
      async (
        _,
        account: AccountData,
        itemId: string,
        profileId?: AccountInfoProfileId,
      ) => {
        await MCPAccountInfo.upgrade(account, itemId, profileId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.CloudStorageListRequest,
      async (_, account: AccountData) => {
        await CloudStorage.list(account)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.CloudStorageDownloadRequest,
      async (_, payload: CloudStorageDownloadRequest) => {
        await CloudStorage.download(payload)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.CloudStoragePickRequest,
      async () => {
        await CloudStorage.pick()
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.CloudStorageApplyRequest,
      async (_, payload: CloudStorageApplyRequest) => {
        await CloudStorage.apply(payload)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AccountExportRequest,
      async (_, payload: AccountExportRequest['accounts']) => {
        await AccountExport.exportAccounts({ accounts: payload })
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.SetHombaseName,
      async (_, accounts: Array<AccountData>, homebaseName: string) => {
        await MCPHomebaseName.update(accounts, homebaseName)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.XPBoostsAccountProfileRequest,
      async (_, accounts: Array<AccountData>) => {
        await XPBoostsManager.requestAccounts(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.XPBoostsConsumePersonal,
      async (_, data: XPBoostsConsumePersonalData) => {
        await XPBoostsManager.consumePersonal(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.XPBoostsConsumeTeammate,
      async (_, data: XPBoostsConsumeTeammateData) => {
        await XPBoostsManager.consumeTeammate(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.XPBoostsSearchUser,
      async (_, config: XPBoostsSearchUserConfig) => {
        await XPBoostsManager.searchUser(
          ElectronAPIEventKeys.XPBoostsSearchUserNotification,
          config,
        )
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.XPBoostsGeneralSearchUser,
      async (_, config: XPBoostsSearchUserConfig) => {
        await XPBoostsManager.generalSearchUser(config)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.UnlockRequest,
      async (_, accounts: Array<AccountData>) => {
        await Unlock.start(accounts)
      },
    )

    /**
     * Party
     */

    ipcMain.on(
      ElectronAPIEventKeys.PartyClaimAction,
      async (_, selectedAccount: Array<AccountData>) => {
        await ClaimRewards.start(selectedAccount)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyKickAction,
      async (
        _,
        selectedAccount: AccountData,
        accounts: AccountDataList,
        claimState: boolean,
      ) => {
        await Party.kickPartyMembers(
          selectedAccount,
          accounts,
          claimState,
          {
            force: true,
          },
        )
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyLeaveAction,
      async (
        _,
        selectedAccounts: AccountList,
        accounts: AccountDataList,
        claimState: boolean,
      ) => {
        await Party.leaveParty(selectedAccounts, accounts, claimState)
      },
    )

    ipcMain.on(ElectronAPIEventKeys.PartyLoadFriends, async () => {
      await Party.loadFriends()
    })

    ipcMain.on(
      ElectronAPIEventKeys.PartyAddNewFriendAction,
      async (_, account: AccountData, displayName: string) => {
        await Party.addNewFriend(account, displayName)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyInviteAction,
      async (_, account: AccountData, accountIds: Array<string>) => {
        await Party.invite(account, accountIds)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyLookupPlayerAction,
      async (
        _,
        accounts: AccountDataList,
        displayName: string,
      ) => {
        await Party.lookupPlayer(accounts, displayName)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartySendFriendRequestAction,
      async (
        _,
        accounts: AccountDataList,
        friendId: string,
      ) => {
        await Party.sendFriendRequests(accounts, friendId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyIncomingFriendRequestsRequest,
      async (_, accounts: AccountDataList) => {
        await Party.listIncomingFriendRequests(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyAcceptIncomingFriendRequests,
      async (
        _,
        items: Array<{ account: AccountData; friendId: string }>,
      ) => {
        await Party.acceptIncomingFriendRequests(items)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyRemoveFriendAction,
      async (
        _,
        data: {
          accountId: string
          displayName: string
        },
      ) => {
        await Party.removeFriend(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyStatusRequest,
      async (_, accounts: Array<AccountData>) => {
        await Party.requestStatus(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyStatusKickMember,
      async (
        _,
        account: AccountData,
        memberAccountId: string,
      ) => {
        await Party.kickStatusMember(account, memberAccountId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyStatusPromoteMember,
      async (
        _,
        account: AccountData,
        memberAccountId: string,
      ) => {
        await Party.promoteStatusMember(account, memberAccountId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.PartyStatusLeave,
      async (_, account: AccountData) => {
        await Party.leaveStatus(account)
      },
    )

    /**
     * Advanced Mode
     */

    ipcMain.on(
      ElectronAPIEventKeys.HomeFetchPlayerRequest,
      async (_, config: AlertsDoneSearchPlayerConfig) => {
        await AlertsDone.fetchPlayerData(config)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AlertsDoneCheckRequest,
      async (_, accounts: Array<AccountData>) => {
        await AlertsDone.checkAccounts(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.WorldInfoSaveFile,
      async (_, data: SaveWorldInfoData) => {
        await WorldInfoManager.saveFile(data)
      },
    )

    ipcMain.on(ElectronAPIEventKeys.WorldInfoRequestFiles, async () => {
      await WorldInfoManager.requestFiles()
    })

    ipcMain.handle(
      ElectronAPIEventKeys.WorldInfoGetSwapSources,
      async (_, todayDate?: string) => {
        return WorldInfoManager.getSwapSources(todayDate)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.WorldInfoDeleteFile,
      async (_, data: WorldInfoFileData) => {
        await WorldInfoManager.deleteFile(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.WorldInfoExportFile,
      async (_, data: WorldInfoFileData) => {
        await WorldInfoManager.exportWorldInfoFile(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.WorldInfoOpenFile,
      async (_, data: WorldInfoFileData) => {
        await WorldInfoManager.openWorldInfoFile(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.WorldInfoRenameFile,
      async (_, data: WorldInfoFileData, newFilename: string) => {
        await WorldInfoManager.renameFile(data, newFilename)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.MatchmakingTrackSaveFile,
      async (_, account: AccountData, accountId: string) => {
        await MatchmakingTrack.saveFile(account, accountId)
      },
    )

    /**
     * Automation
     */

    ipcMain.on(
      ElectronAPIEventKeys.AutomationServiceRequestData,
      async () => {
        await Automation.load()
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutomationServiceStart,
      async (_, accountId: string) => {
        await Automation.addAccount(accountId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutomationServiceReload,
      async (_, accountId: string) => {
        await Automation.reload(accountId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutomationServiceRemove,
      async (_, accountId: string) => {
        await Automation.removeAccount(accountId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutomationServiceActionUpdate,
      async (
        _,
        accountId: string,
        config: AutomationServiceActionConfig,
      ) => {
        await Automation.updateAction(accountId, config)
      },
    )

    ipcMain.on(ElectronAPIEventKeys.AutomationLogFileRequest, async () => {
      const status = await AutomationLogFile.getStatus()

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.AutomationLogFileNotification,
        status,
      )
      await AutomationLogFile.start()
    })

    ipcMain.on(
      ElectronAPIEventKeys.AutomationLogFileUpdate,
      async (_, partial: Partial<AutomationLogFileSettings>) => {
        await AutomationLogFile.updateSettings(partial)
      },
    )

    ipcMain.on(ElectronAPIEventKeys.AutomationLogFilePick, async () => {
      await AutomationLogFile.pickLogFile()
    })

    /**
     * Taxi Service
     */

    ipcMain.on(
      ElectronAPIEventKeys.TaxiServiceServiceAddAccounts,
      async (_, origin: Array<string>, destination: Array<string>) => {
        await TaxiService.sendRequests(origin, destination)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.TaxiServiceServiceRequestData,
      async () => {
        await TaxiService.load()
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.TaxiServiceServiceStart,
      async (_, accountId: string) => {
        await TaxiService.addAccount(accountId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.TaxiServiceServiceReload,
      async (_, ids: Array<string>) => {
        await TaxiService.reload(ids)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.TaxiServiceServiceRemove,
      async (_, accountId: string) => {
        await TaxiService.removeAccount(accountId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.TaxiServiceServiceActionUpdate,
      async (
        _,
        accountId: string,
        config: TaxiServiceServiceActionConfig,
      ) => {
        await TaxiService.updateAction(accountId, config)
      },
    )

    /**
     * Urns
     */

    ipcMain.on(ElectronAPIEventKeys.UrnsServiceRequestData, async () => {
      await AutoPinUrns.load()
    })

    ipcMain.on(
      ElectronAPIEventKeys.UrnsServiceAdd,
      async (_, accountId: string) => {
        await AutoPinUrns.addAccount(accountId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.UrnsServiceUpdate,
      async (
        _,
        accountId: string,
        type: 'mini-bosses' | 'urns',
        value: boolean,
      ) => {
        await AutoPinUrns.updateAccount(accountId, type, value)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.UrnsServiceRemove,
      async (_, accountId: string) => {
        await AutoPinUrns.removeAccount(accountId)
      },
    )

    /**
     * Auto-llamas
     */

    ipcMain.on(
      ElectronAPIEventKeys.AutoLlamasLoadAccountsRequest,
      async () => {
        await AutoLlamas.load()

        ProcessAutoLlamas.start({
          selected: AutoLlamas.getAccounts({
            type: ProcessLlamaType.FreeUpgrade,
          }),
          type: ProcessLlamaType.FreeUpgrade,
        })

        ProcessAutoLlamas.start({
          selected: AutoLlamas.getAccounts({
            type: ProcessLlamaType.Survivor,
          }),
          type: ProcessLlamaType.Survivor,
        })
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutoLlamasAccountAdd,
      async (_, accounts: AutoLlamasAccountAddParams) => {
        await AutoLlamas.addAccount(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutoLlamasAccountUpdate,
      async (_, data: AutoLlamasAccountUpdateParams) => {
        await AutoLlamas.updateAccounts(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.AutoLlamasAccountRemove,
      async (_, data: Array<string> | null) => {
        await AutoLlamas.removeAccounts(data)
      },
    )

    ipcMain.on(ElectronAPIEventKeys.AutoLlamasAccountCheck, async () => {
      await AutoLlamas.check()
    })

    /**
     * Llama Manager
     */

    ipcMain.on(
      ElectronAPIEventKeys.LlamaManagerRequestData,
      async (_, accounts: Array<AccountData>) => {
        await LlamaManager.requestBulk(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.LlamaManagerPurchase,
      async (_, data: LlamaManagerPurchaseRequest) => {
        await LlamaManager.purchase(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.LlamaManagerBulkPurchase,
      async (_, data: LlamaManagerBulkPurchaseRequest) => {
        await LlamaManager.bulkPurchase(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.LlamaManagerBulkPurchaseMini,
      async (_, data: LlamaManagerBulkPurchaseRequest) => {
        await LlamaManager.bulkPurchase({
          ...data,
          kind: data.kind ?? 'mini',
        })
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.LlamaManagerOpenPacks,
      async (_, data: LlamaManagerOpenRequest) => {
        await LlamaManager.openPacks(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.LlamaManagerOpenChoice,
      async (_, data: LlamaManagerOpenChoiceRequest) => {
        await LlamaManager.openChoicePack(data)
      },
    )

    /**
     * Item Shop
     */

    ipcMain.on(ElectronAPIEventKeys.ItemShopLoadCache, async () => {
      await ItemShop.loadCachedCatalog()
    })

    ipcMain.on(ElectronAPIEventKeys.ItemShopGiftHistoryRequest, async () => {
      await ItemShop.loadGiftHistory()
    })

    ipcMain.on(
      ElectronAPIEventKeys.ItemShopCatalogRequest,
      async (_, account: AccountData) => {
        await ItemShop.requestCatalog(account)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.ItemShopAccountsRequest,
      async (_, accounts: Array<AccountData>) => {
        await ItemShop.requestAccounts(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.ItemShopCreatorCode,
      async (_, data: ItemShopCreatorCodeRequest) => {
        await ItemShop.applyCreatorCode(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.ItemShopPurchase,
      async (_, data: ItemShopPurchaseRequest) => {
        await ItemShop.purchase(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.ItemShopGift,
      async (_, data: ItemShopGiftRequest) => {
        await ItemShop.gift(data)
      },
    )

    /**
     * Collection Book Manager
     */

    ipcMain.on(
      ElectronAPIEventKeys.CollectionBookRequestData,
      async (_, accounts: Array<AccountData>) => {
        await CollectionBookManager.requestBulk(accounts)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.CollectionBookUpgrade,
      async (_, data: CollectionBookUpgradeRequest) => {
        await CollectionBookManager.upgrade(data)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.CollectionBookSlot,
      async (_, data: CollectionBookSlotRequest) => {
        await CollectionBookManager.slotItems(data)
      },
    )

    /**
     * V-Bucks Information
     */

    ipcMain.on(
      ElectronAPIEventKeys.VBucksInformationRequest,
      async (_, accounts: Array<AccountData>) => {
        await VBucksInformation.requestBulkInfo(accounts)
      },
    )

    /**
     * Redeem Codes
     */

    ipcMain.on(
      ElectronAPIEventKeys.RedeemCodesRedeem,
      async (_, accounts: Array<AccountData>, codes: Array<string>) => {
        await RedeemCodes.redeem(accounts, codes)
      },
    )

    /**
     * Accounts
     */

    ipcMain.on(
      ElectronAPIEventKeys.UpdateAccountBasicInfo,
      async (_, account: AccountBasicInfo) => {
        await AccountsManager.add(account)
        MainWindow.instance.webContents.send(
          ElectronAPIEventKeys.ResponseUpdateAccountBasicInfo,
        )
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.DevicesAuthRequestData,
      async (_, account: AccountData) => {
        await DevicesAuthManager.load(account)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.DevicesAuthRemove,
      async (_, account: AccountData, deviceId: string) => {
        await DevicesAuthManager.remove(account, deviceId)
      },
    )

    ipcMain.on(
      ElectronAPIEventKeys.EULAVerificationRequest,
      async (_, accountIds: Array<string>) => {
        await EULATracking.verify(accountIds)
      },
    )

    /**
     * Schedules
     */

    schedule.scheduleJob(
      {
        /**
         * Executes in every reset at time: 00:00:10 AM
         * Hour: 00
         * Minute: 00
         * Second: 10
         */
        rule: '10 0 0 * * *',
        /**
         * Time zone
         */
        tz: 'UTC',
      },
      () => {
        WorldInfoManager.requestForHome().catch(() => {})
        WorldInfoManager.requestForAdvanceSection().catch(() => {})
      },
    )

    schedule.scheduleJob(
      {
        /**
         * Runs: daily every hour
         * Hour: every hour
         * Minute: 1
         */
        rule: '1 * * * *',
        /**
         * Time zone
         */
        tz: 'UTC',
      },
      () => {
        ProcessAutoLlamas.start({
          selected: AutoLlamas.getAccounts({
            type: ProcessLlamaType.FreeUpgrade,
          }),
          type: ProcessLlamaType.FreeUpgrade,
        })
      },
    )

    schedule.scheduleJob(
      {
        /**
         * Runs: every reset at time: 00:01:00 AM
         * Hour: 0 AM (midnight)
         * Minute: 1
         */
        rule: '1 0 * * *',
        /**
         * Time zone
         */
        tz: 'UTC',
      },
      () => {
        ProcessAutoLlamas.start({
          selected: AutoLlamas.getAccounts({
            type: ProcessLlamaType.Survivor,
          }),
          type: ProcessLlamaType.Survivor,
        })
      },
    )

    /**
     * Auto Daily Quests (ClientQuestLogin)
     */

    const runAutoDailyQuests = async () => {
      const settings = await SettingsManager.getData()

      if (!settings.autoDailyQuests) {
        return
      }

      const accounts = AccountsManager.getAccounts()

      if (accounts.size > 0) {
        MCPClientQuestLogin.save([...accounts.values()])
      }
    }

    schedule.scheduleJob(
      {
        /**
         * Runs: every reset at time: 00:01:00 AM
         * Hour: 0 AM (midnight)
         * Minute: 1
         * Second: 0
         */
        rule: '0 1 0 * * *',
        /**
         * Time zone
         */
        tz: 'UTC',
      },
      runAutoDailyQuests
    )

    // Startup trigger: run once after accounts have loaded
    setTimeout(runAutoDailyQuests, 30_000)
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (!SystemTray.isActive) {
      MainWindow.closeApp()
    }
  })

  app.on('activate', async () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      MainWindow.setInstance(await createWindow())
    }
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and import them here.
})()
